from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, extract
from fastapi import HTTPException

from app.models.hackathon import Hackathon
from app.models.project import Project
from app.models.team_member import TeamMember
from app.models.link import Link
from app.models.technology import Technology
from app.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonListRead
from app.services.technology_service import TechnologyService
from app.services.attachment_service import AttachmentService

def get_hackathon_cover_thumbnail_url(hackathon: Hackathon) -> Optional[str]:
    for att in hackathon.attachments:
        if att.is_cover and att.mime_type != "application/pdf":
            return f"/attachments/{att.id}/thumbnail"
    for att in hackathon.attachments:
        if att.mime_type != "application/pdf":
            return f"/attachments/{att.id}/thumbnail"
    return None

class HackathonService:
    @staticmethod
    def create(db: Session, data: HackathonCreate) -> Hackathon:
        # Verify linked project exists if provided
        if data.project_id is not None:
            proj = db.query(Project).filter(Project.id == data.project_id).first()
            if not proj:
                raise HTTPException(status_code=422, detail="Specified project_id does not exist")

        # Deduplicate links by URL
        seen_urls = set()
        unique_links = []
        for l in data.links:
            clean_url = l.url.strip()
            if clean_url not in seen_urls:
                unique_links.append(l)
                seen_urls.add(clean_url)

        hackathon = Hackathon(
            name=data.name,
            organiser=data.organiser,
            start_date=data.start_date,
            end_date=data.end_date,
            mode=data.mode,
            location=data.location,
            problem_statement_id=data.problem_statement_id,
            problem_statement=data.problem_statement,
            team_name=data.team_name,
            my_role=data.my_role,
            submission_summary=data.submission_summary,
            result=data.result,
            result_detail=data.result_detail,
            feedback=data.feedback,
            lessons_learned=data.lessons_learned,
            notes=data.notes,
            is_featured=data.is_featured,
            project_id=data.project_id,
        )

        if data.technologies:
            hackathon.technologies = TechnologyService.get_or_create_technologies(db, data.technologies)

        for tm in data.team_members:
            hackathon.team_members.append(
                TeamMember(name=tm.name, role=tm.role, linkedin_url=tm.linkedin_url)
            )

        for l in unique_links:
            hackathon.links.append(
                Link(label=l.label, url=l.url, kind=l.kind, sort_order=l.sort_order)
            )

        db.add(hackathon)
        db.commit()
        db.refresh(hackathon)
        return hackathon

    @staticmethod
    def get_by_id(db: Session, hackathon_id: int) -> Hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found")
        return hackathon

    @staticmethod
    def list(
        db: Session,
        result: Optional[str] = None,
        year: Optional[int] = None,
        technology: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        include_archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[HackathonListRead]:
        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        q = db.query(Hackathon)

        if not include_archived:
            q = q.filter(Hackathon.archived_at.is_(None))

        if result:
            q = q.filter(Hackathon.result == result)

        if year:
            q = q.filter(extract("year", Hackathon.start_date) == year)

        if featured is not None:
            q = q.filter(Hackathon.is_featured == featured)

        if technology and technology.strip():
            tech_clean = technology.strip().lower()
            q = q.join(Hackathon.technologies).filter(func.lower(Technology.name) == tech_clean)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            q = q.filter(
                or_(
                    func.lower(Hackathon.name).like(term),
                    func.lower(Hackathon.organiser).like(term),
                    func.lower(Hackathon.submission_summary).like(term),
                )
            )

        q = q.order_by(
            Hackathon.is_featured.desc(),
            Hackathon.start_date.desc().nullslast(),
            Hackathon.id.desc(),
        )

        hackathons = q.offset(offset).limit(limit).all()

        results = []
        for h in hackathons:
            results.append(
                HackathonListRead(
                    id=h.id,
                    name=h.name,
                    organiser=h.organiser,
                    start_date=h.start_date,
                    end_date=h.end_date,
                    mode=h.mode,
                    location=h.location,
                    my_role=h.my_role,
                    result=h.result,
                    is_featured=h.is_featured,
                    archived_at=h.archived_at,
                    project_id=h.project_id,
                    project_title=h.project.title if h.project else None,
                    cover_thumbnail_url=get_hackathon_cover_thumbnail_url(h),
                    technologies=[t.name for t in h.technologies],
                    link_count=len(h.links),
                    attachment_count=len(h.attachments),
                    created_at=h.created_at,
                    updated_at=h.updated_at,
                )
            )
        return results

    @staticmethod
    def update(db: Session, hackathon_id: int, data: HackathonUpdate) -> Hackathon:
        hackathon = HackathonService.get_by_id(db, hackathon_id)

        if data.project_id is not None:
            proj = db.query(Project).filter(Project.id == data.project_id).first()
            if not proj:
                raise HTTPException(status_code=422, detail="Specified project_id does not exist")
            hackathon.project_id = data.project_id
        elif "project_id" in data.model_fields_set and data.project_id is None:
            hackathon.project_id = None

        update_fields = [
            "name", "organiser", "start_date", "end_date", "mode",
            "location", "problem_statement_id", "problem_statement",
            "team_name", "my_role", "submission_summary", "result",
            "result_detail", "feedback", "lessons_learned", "notes",
            "is_featured"
        ]
        for field in update_fields:
            val = getattr(data, field)
            if val is not None:
                setattr(hackathon, field, val)

        if data.technologies is not None:
            hackathon.technologies = TechnologyService.get_or_create_technologies(db, data.technologies)

        if data.team_members is not None:
            hackathon.team_members.clear()
            for tm in data.team_members:
                hackathon.team_members.append(
                    TeamMember(name=tm.name, role=tm.role, linkedin_url=tm.linkedin_url)
                )

        if data.links is not None:
            hackathon.links.clear()
            seen_urls = set()
            for l in data.links:
                clean_url = l.url.strip()
                if clean_url not in seen_urls:
                    hackathon.links.append(
                        Link(label=l.label, url=l.url, kind=l.kind, sort_order=l.sort_order)
                    )
                    seen_urls.add(clean_url)

        db.commit()
        db.refresh(hackathon)
        return hackathon

    @staticmethod
    def archive(db: Session, hackathon_id: int) -> Hackathon:
        hackathon = HackathonService.get_by_id(db, hackathon_id)
        hackathon.archived_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(hackathon)
        return hackathon

    @staticmethod
    def restore(db: Session, hackathon_id: int) -> Hackathon:
        hackathon = HackathonService.get_by_id(db, hackathon_id)
        hackathon.archived_at = None
        db.commit()
        db.refresh(hackathon)
        return hackathon

    @staticmethod
    def delete(db: Session, hackathon_id: int) -> None:
        hackathon = HackathonService.get_by_id(db, hackathon_id)
        AttachmentService.delete_all_for_owner("hackathons", hackathon_id)
        db.delete(hackathon)
        db.commit()

    @staticmethod
    def generate_showcase(hackathon: Hackathon) -> dict:
        lines = []
        result_badge = hackathon.result.replace("_", " ").capitalize()
        lines.append(f"🏆 {hackathon.name} - {result_badge}")
        if hackathon.organiser:
            lines.append(f"Organised by: {hackathon.organiser}")
        if hackathon.my_role:
            lines.append(f"Role: {hackathon.my_role}")
        lines.append("")

        if hackathon.submission_summary:
            lines.append("What we built:")
            lines.append(hackathon.submission_summary)
            lines.append("")

        if hackathon.technologies:
            tech_names = ", ".join(t.name for t in hackathon.technologies)
            lines.append(f"🛠️ Tech: {tech_names}")

        if hackathon.project:
            lines.append(f"📦 Built Project: {hackathon.project.title}")

        if hackathon.links:
            lines.append("")
            lines.append("🔗 Links:")
            for l in hackathon.links:
                lbl = l.label or l.kind.capitalize()
                lines.append(f"• {lbl}: {l.url}")

        linkedin_text = "\n".join(lines).strip()

        # Markdown version
        md = []
        md.append(f"# {hackathon.name}")
        md.append(f"**Result**: {result_badge}")
        if hackathon.organiser:
            md.append(f"**Organiser**: {hackathon.organiser}")
        if hackathon.mode:
            md.append(f"**Mode**: {hackathon.mode.capitalize()}")
        md.append("")

        if hackathon.problem_statement:
            md.append("## Problem Statement")
            md.append(hackathon.problem_statement)
            md.append("")

        if hackathon.submission_summary:
            md.append("## Submission Summary")
            md.append(hackathon.submission_summary)
            md.append("")

        if hackathon.project:
            md.append(f"**Associated Project**: {hackathon.project.title}")
            md.append("")

        if hackathon.technologies:
            md.append("## Technologies")
            md.append(", ".join(f"`{t.name}`" for t in hackathon.technologies))
            md.append("")

        if hackathon.links:
            md.append("## Links")
            for l in hackathon.links:
                lbl = l.label or l.kind.capitalize()
                md.append(f"- [{lbl}]({l.url})")
            md.append("")

        return {
            "linkedin_text": linkedin_text,
            "markdown": "\n".join(md).strip(),
        }

