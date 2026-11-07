from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException

from app.models.project import Project
from app.models.team_member import TeamMember
from app.models.link import Link
from app.models.technology import Technology, project_technologies
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectListRead
from app.services.technology_service import TechnologyService
from app.services.attachment_service import AttachmentService

def get_cover_thumbnail_url(project: Project) -> Optional[str]:
    # Check for is_cover=True first
    for att in project.attachments:
        if att.is_cover and att.mime_type != "application/pdf":
            return f"/attachments/{att.id}/thumbnail"
    # Otherwise check for first image
    for att in project.attachments:
        if att.mime_type != "application/pdf":
            return f"/attachments/{att.id}/thumbnail"
    return None

class ProjectService:
    @staticmethod
    def create(db: Session, data: ProjectCreate) -> Project:
        # Deduplicate links by URL
        seen_urls = set()
        unique_links = []
        for l in data.links:
            clean_url = l.url.strip()
            if clean_url not in seen_urls:
                unique_links.append(l)
                seen_urls.add(clean_url)

        # 1. Instantiate project
        project = Project(
            title=data.title,
            headline=data.headline,
            description=data.description,
            problem_statement=data.problem_statement,
            category=data.category,
            status=data.status,
            start_date=data.start_date,
            end_date=data.end_date,
            my_contribution=data.my_contribution,
            challenges=data.challenges,
            lessons_learned=data.lessons_learned,
            future_improvements=data.future_improvements,
            notes=data.notes,
            is_featured=data.is_featured,
        )

        # 2. Technologies
        if data.technologies:
            project.technologies = TechnologyService.get_or_create_technologies(db, data.technologies)

        # 3. Team members
        for tm in data.team_members:
            project.team_members.append(
                TeamMember(name=tm.name, role=tm.role, linkedin_url=tm.linkedin_url)
            )

        # 4. Links
        for l in unique_links:
            project.links.append(
                Link(label=l.label, url=l.url, kind=l.kind, sort_order=l.sort_order)
            )

        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    @staticmethod
    def list(
        db: Session,
        status: Optional[str] = None,
        category: Optional[str] = None,
        technology: Optional[str] = None,
        featured: Optional[bool] = None,
        search: Optional[str] = None,
        include_archived: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ProjectListRead]:
        limit = max(1, min(limit, 200))
        offset = max(0, offset)

        q = db.query(Project)

        if not include_archived:
            q = q.filter(Project.archived_at.is_(None))

        if status:
            q = q.filter(Project.status == status)

        if category:
            q = q.filter(func.lower(Project.category) == category.lower())

        if featured is not None:
            q = q.filter(Project.is_featured == featured)

        if technology and technology.strip():
            tech_clean = technology.strip().lower()
            q = q.join(Project.technologies).filter(func.lower(Technology.name) == tech_clean)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            q = q.filter(
                or_(
                    func.lower(Project.title).like(term),
                    func.lower(Project.headline).like(term),
                    func.lower(Project.description).like(term),
                )
            )

        # Sort by featured first, then newest start date, then id desc
        q = q.order_by(
            Project.is_featured.desc(),
            Project.start_date.desc().nullslast(),
            Project.id.desc(),
        )

        projects = q.offset(offset).limit(limit).all()

        results = []
        for p in projects:
            results.append(
                ProjectListRead(
                    id=p.id,
                    title=p.title,
                    headline=p.headline,
                    category=p.category,
                    status=p.status,
                    start_date=p.start_date,
                    end_date=p.end_date,
                    is_featured=p.is_featured,
                    archived_at=p.archived_at,
                    cover_thumbnail_url=get_cover_thumbnail_url(p),
                    technologies=[t.name for t in p.technologies],
                    link_count=len(p.links),
                    attachment_count=len(p.attachments),
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
            )
        return results

    @staticmethod
    def update(db: Session, project_id: int, data: ProjectUpdate) -> Project:
        project = ProjectService.get_by_id(db, project_id)

        update_fields = [
            "title", "headline", "description", "problem_statement",
            "category", "status", "start_date", "end_date",
            "my_contribution", "challenges", "lessons_learned",
            "future_improvements", "notes", "is_featured"
        ]
        for field in update_fields:
            val = getattr(data, field)
            if val is not None:
                setattr(project, field, val)

        # List replacement if explicitly provided
        if data.technologies is not None:
            project.technologies = TechnologyService.get_or_create_technologies(db, data.technologies)

        if data.team_members is not None:
            project.team_members.clear()
            for tm in data.team_members:
                project.team_members.append(
                    TeamMember(name=tm.name, role=tm.role, linkedin_url=tm.linkedin_url)
                )

        if data.links is not None:
            project.links.clear()
            seen_urls = set()
            for l in data.links:
                clean_url = l.url.strip()
                if clean_url not in seen_urls:
                    project.links.append(
                        Link(label=l.label, url=l.url, kind=l.kind, sort_order=l.sort_order)
                    )
                    seen_urls.add(clean_url)

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def archive(db: Session, project_id: int) -> Project:
        project = ProjectService.get_by_id(db, project_id)
        project.archived_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def restore(db: Session, project_id: int) -> Project:
        project = ProjectService.get_by_id(db, project_id)
        project.archived_at = None
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete(db: Session, project_id: int) -> None:
        project = ProjectService.get_by_id(db, project_id)
        # Delete associated files from disk
        AttachmentService.delete_all_for_owner("projects", project_id)
        db.delete(project)
        db.commit()

    @staticmethod
    def generate_showcase(project: Project) -> dict:
        # Plain deterministic formatting - strictly saved fields only
        lines = []
        lines.append(f"🚀 {project.title}")
        if project.headline:
            lines.append(project.headline)
        lines.append("")

        if project.my_contribution:
            lines.append("Key Highlights:")
            lines.append(project.my_contribution)
            lines.append("")
        elif project.description:
            lines.append(project.description)
            lines.append("")

        if project.technologies:
            tech_names = ", ".join(t.name for t in project.technologies)
            lines.append(f"🛠️ Tech: {tech_names}")

        if project.links:
            lines.append("")
            lines.append("🔗 Links:")
            for l in project.links:
                lbl = l.label or l.kind.capitalize()
                lines.append(f"• {lbl}: {l.url}")

        linkedin_text = "\n".join(lines).strip()

        # Markdown version
        md = []
        md.append(f"# {project.title}")
        if project.headline:
            md.append(f"*{project.headline}*")
        md.append("")

        if project.description:
            md.append("## Overview")
            md.append(project.description)
            md.append("")

        if project.problem_statement:
            md.append("## Problem Statement")
            md.append(project.problem_statement)
            md.append("")

        if project.my_contribution:
            md.append("## My Contribution")
            md.append(project.my_contribution)
            md.append("")

        if project.technologies:
            md.append("## Technologies")
            md.append(", ".join(f"`{t.name}`" for t in project.technologies))
            md.append("")

        if project.links:
            md.append("## Links")
            for l in project.links:
                lbl = l.label or l.kind.capitalize()
                md.append(f"- [{lbl}]({l.url})")
            md.append("")

        return {
            "linkedin_text": linkedin_text,
            "markdown": "\n".join(md).strip(),
        }

