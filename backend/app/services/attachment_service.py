import os
import io
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from PIL import Image

from app.core.config import settings
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentUpdate

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024       # 5 MB
MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024        # 10 MB
MAX_ATTACHMENTS_PER_OWNER = 20

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

ALLOWED_DOC_TYPES = {
    "application/pdf": ".pdf",
}

def detect_mime_type(header: bytes) -> Optional[str]:
    """Detect mime type strictly from file magic bytes, never trust client extension or content-type."""
    if len(header) >= 3 and header[:3] == b"\xFF\xD8\xFF":
        return "image/jpeg"
    if len(header) >= 8 and header[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    if len(header) >= 6 and (header[:6] == b"GIF87a" or header[:6] == b"GIF89a"):
        return "image/gif"
    if len(header) >= 5 and header[:5] == b"%PDF-":
        return "application/pdf"
    return None

def sanitize_filename(name: str) -> str:
    """Strip any path traversal or invalid characters and keep safe basename max 200 chars."""
    if not name:
        return "attachment"
    clean = Path(name).name.replace("\x00", "").strip()
    clean = "".join(c for c in clean if c.isalnum() or c in " ._-()")
    return clean[:200] if clean else "attachment"

def get_owner_upload_dir(owner_type: str, owner_id: int) -> Path:
    folder = settings.uploads_dir / owner_type / str(owner_id)
    folder.mkdir(parents=True, exist_ok=True)
    return folder

class AttachmentService:
    @staticmethod
    async def process_and_save_upload(
        db: Session,
        upload_file: UploadFile,
        owner_type: str,  # "projects" or "hackathons"
        owner_id: int,
        kind: str,
        caption: Optional[str] = None,
        alt_text: Optional[str] = None,
    ) -> Attachment:
        # 1. Enforce max 20 attachments per owner
        existing_count = (
            db.query(Attachment)
            .filter(
                Attachment.project_id == owner_id if owner_type == "projects" else Attachment.hackathon_id == owner_id
            )
            .count()
        )
        if existing_count >= MAX_ATTACHMENTS_PER_OWNER:
            raise HTTPException(
                status_code=422,
                detail=f"Maximum limit of {MAX_ATTACHMENTS_PER_OWNER} attachments reached for this {owner_type[:-1]}",
            )

        # 2. Stream chunk-by-chunk to enforce size limits while reading magic bytes
        max_bytes = MAX_DOC_SIZE_BYTES if kind in ("document", "certificate") else MAX_IMAGE_SIZE_BYTES
        content = bytearray()
        chunk_size = 64 * 1024  # 64 KB

        while True:
            chunk = await upload_file.read(chunk_size)
            if not chunk:
                break
            content.extend(chunk)
            if len(content) > max_bytes:
                raise HTTPException(
                    status_code=422,
                    detail=f"File exceeds maximum allowed size ({max_bytes // (1024 * 1024)} MB)",
                )

        if not content:
            raise HTTPException(status_code=422, detail="Uploaded file is empty")

        # 3. Magic bytes validation
        mime_type = detect_mime_type(bytes(content[:32]))
        if not mime_type:
            raise HTTPException(
                status_code=422,
                detail="Invalid or unsupported file format. Allowed: JPEG, PNG, WebP, GIF, and PDF (no SVG or executables).",
            )

        if kind in ("document", "certificate"):
            if mime_type != "application/pdf":
                raise HTTPException(status_code=422, detail="Documents and certificates must be in PDF format")
            safe_ext = ".pdf"
        else:
            if mime_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(status_code=422, detail=f"Image format {mime_type} is not supported")
            safe_ext = ALLOWED_IMAGE_TYPES[mime_type]

        # 4. Generate UUID name and destination paths
        file_uuid = uuid.uuid4().hex
        stored_name = f"{file_uuid}{safe_ext}"
        thumb_name = f"{file_uuid}_thumb{safe_ext}" if mime_type != "application/pdf" else None

        owner_dir = get_owner_upload_dir(owner_type, owner_id)
        file_path = owner_dir / stored_name
        thumb_path = owner_dir / thumb_name if thumb_name else None

        width: Optional[int] = None
        height: Optional[int] = None

        # 5. Image verification, EXIF stripping, and thumbnail generation using Pillow
        saved_files = []
        try:
            if mime_type != "application/pdf":
                # Verify image integrity
                try:
                    verify_img = Image.open(io.BytesIO(content))
                    verify_img.verify()
                except Exception:
                    raise HTTPException(status_code=422, detail="Corrupt or invalid image file")

                # Open real image, get dimensions, strip EXIF
                img = Image.open(io.BytesIO(content))
                width, height = img.size

                # Save sanitized image without EXIF data
                # Convert palette/transparency safely for saving
                img_format = "JPEG" if mime_type == "image/jpeg" else ("PNG" if mime_type == "image/png" else ("WEBP" if mime_type == "image/webp" else "GIF"))
                if img_format == "JPEG" and img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                # Clean save without EXIF
                img.save(file_path, format=img_format, quality=90)
                saved_files.append(file_path)

                # Generate max 480px thumbnail
                thumb = img.copy()
                thumb.thumbnail((480, 480), Image.Resampling.LANCZOS)
                thumb.save(thumb_path, format=img_format, quality=85)
                saved_files.append(thumb_path)
            else:
                # PDF write directly
                file_path.write_bytes(content)
                saved_files.append(file_path)

            # 6. Database record creation
            clean_original = sanitize_filename(upload_file.filename or "attachment")
            is_first = (existing_count == 0 and mime_type != "application/pdf")

            attachment = Attachment(
                kind=kind,
                original_name=clean_original,
                stored_name=stored_name,
                mime_type=mime_type,
                size_bytes=len(content),
                width=width,
                height=height,
                caption=caption.strip() if caption else None,
                alt_text=alt_text.strip() if alt_text else None,
                sort_order=existing_count,
                is_cover=is_first,
                project_id=owner_id if owner_type == "projects" else None,
                hackathon_id=owner_id if owner_type == "hackathons" else None,
            )
            db.add(attachment)
            db.commit()
            db.refresh(attachment)
            return attachment

        except Exception as e:
            # Clean up orphan files if database or processing failed
            for f in saved_files:
                try:
                    if f.exists():
                        f.unlink()
                except OSError:
                    pass
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to process attachment: {e}")

    @staticmethod
    def get_by_id(db: Session, attachment_id: int) -> Attachment:
        att = db.query(Attachment).filter(Attachment.id == attachment_id).first()
        if not att:
            raise HTTPException(status_code=404, detail="Attachment not found")
        return att

    @staticmethod
    def update(db: Session, attachment_id: int, data: AttachmentUpdate) -> Attachment:
        att = AttachmentService.get_by_id(db, attachment_id)

        if data.caption is not None:
            att.caption = data.caption.strip() if data.caption else None
        if data.alt_text is not None:
            att.alt_text = data.alt_text.strip() if data.alt_text else None
        if data.sort_order is not None:
            att.sort_order = data.sort_order

        if data.is_cover is True:
            # In a transaction, clear old cover for this owner
            if att.project_id:
                db.query(Attachment).filter(
                    Attachment.project_id == att.project_id,
                    Attachment.id != att.id,
                ).update({"is_cover": False})
            elif att.hackathon_id:
                db.query(Attachment).filter(
                    Attachment.hackathon_id == att.hackathon_id,
                    Attachment.id != att.id,
                ).update({"is_cover": False})
            att.is_cover = True
        elif data.is_cover is False:
            att.is_cover = False

        db.commit()
        db.refresh(att)
        return att

    @staticmethod
    def delete(db: Session, attachment_id: int) -> None:
        att = AttachmentService.get_by_id(db, attachment_id)
        owner_type = "projects" if att.project_id else "hackathons"
        owner_id = att.project_id or att.hackathon_id

        # Delete physical files
        if owner_id:
            owner_dir = settings.uploads_dir / owner_type / str(owner_id)
            orig_file = owner_dir / att.stored_name
            try:
                if orig_file.exists():
                    orig_file.unlink()
            except OSError:
                pass

            if att.mime_type != "application/pdf":
                name_parts = att.stored_name.rsplit(".", 1)
                thumb_file = owner_dir / f"{name_parts[0]}_thumb.{name_parts[1]}"
                try:
                    if thumb_file.exists():
                        thumb_file.unlink()
                except OSError:
                    pass

        db.delete(att)
        db.commit()

    @staticmethod
    def delete_all_for_owner(owner_type: str, owner_id: int) -> None:
        """Remove physical files folder for a deleted project or hackathon."""
        owner_dir = settings.uploads_dir / owner_type / str(owner_id)
        if owner_dir.exists():
            import shutil
            try:
                shutil.rmtree(owner_dir)
            except OSError:
                pass

