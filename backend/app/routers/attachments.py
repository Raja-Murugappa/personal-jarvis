from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.attachment import AttachmentRead, AttachmentUpdate, AttachmentKind
from app.services.attachment_service import AttachmentService
from app.models.attachment import Attachment

router = APIRouter(tags=["attachments"])

def format_attachment_read(att: Attachment) -> AttachmentRead:
    has_thumb = att.mime_type != "application/pdf"
    return AttachmentRead(
        id=att.id,
        kind=att.kind,
        original_name=att.original_name,
        stored_name=att.stored_name,
        mime_type=att.mime_type,
        size_bytes=att.size_bytes,
        width=att.width,
        height=att.height,
        caption=att.caption,
        alt_text=att.alt_text,
        sort_order=att.sort_order,
        is_cover=att.is_cover,
        project_id=att.project_id,
        hackathon_id=att.hackathon_id,
        created_at=att.created_at,
        file_url=f"/attachments/{att.id}/file",
        thumbnail_url=f"/attachments/{att.id}/thumbnail" if has_thumb else None,
    )

@router.post("/projects/{id}/attachments", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED)
async def upload_project_attachment(
    id: int,
    file: UploadFile = File(...),
    kind: AttachmentKind = Form("image"),
    caption: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    from app.services.project_service import ProjectService
    ProjectService.get_by_id(db, id)  # Ensure project exists
    att = await AttachmentService.process_and_save_upload(
        db=db,
        upload_file=file,
        owner_type="projects",
        owner_id=id,
        kind=kind,
        caption=caption,
        alt_text=alt_text,
    )
    return format_attachment_read(att)

@router.post("/hackathons/{id}/attachments", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED)
async def upload_hackathon_attachment(
    id: int,
    file: UploadFile = File(...),
    kind: AttachmentKind = Form("image"),
    caption: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    from app.services.hackathon_service import HackathonService
    HackathonService.get_by_id(db, id)  # Ensure hackathon exists
    att = await AttachmentService.process_and_save_upload(
        db=db,
        upload_file=file,
        owner_type="hackathons",
        owner_id=id,
        kind=kind,
        caption=caption,
        alt_text=alt_text,
    )
    return format_attachment_read(att)

@router.put("/attachments/{id}", response_model=AttachmentRead)
def update_attachment(
    id: int,
    data: AttachmentUpdate,
    db: Session = Depends(get_db),
):
    att = AttachmentService.update(db, id, data)
    return format_attachment_read(att)

@router.delete("/attachments/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(id: int, db: Session = Depends(get_db)):
    AttachmentService.delete(db, id)

@router.get("/attachments/{id}/file")
def get_attachment_file(id: int, db: Session = Depends(get_db)):
    att = AttachmentService.get_by_id(db, id)
    owner_type = "projects" if att.project_id else "hackathons"
    owner_id = att.project_id or att.hackathon_id
    file_path = settings.uploads_dir / owner_type / str(owner_id) / att.stored_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_path,
        media_type=att.mime_type,
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": f'inline; filename="{att.original_name}"',
        },
    )

@router.get("/attachments/{id}/thumbnail")
def get_attachment_thumbnail(id: int, db: Session = Depends(get_db)):
    att = AttachmentService.get_by_id(db, id)
    if att.mime_type == "application/pdf":
        raise HTTPException(status_code=404, detail="Thumbnails not available for documents")

    owner_type = "projects" if att.project_id else "hackathons"
    owner_id = att.project_id or att.hackathon_id
    name_parts = att.stored_name.rsplit(".", 1)
    thumb_name = f"{name_parts[0]}_thumb.{name_parts[1]}"
    thumb_path = settings.uploads_dir / owner_type / str(owner_id) / thumb_name

    if not thumb_path.exists():
        # Fall back to original file if thumbnail missing
        thumb_path = settings.uploads_dir / owner_type / str(owner_id) / att.stored_name

    if not thumb_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found on disk")

    return FileResponse(
        path=thumb_path,
        media_type=att.mime_type,
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": f'inline; filename="thumb_{att.original_name}"',
        },
    )

