from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from fastapi import HTTPException
from app.models.technology import Technology, project_technologies, hackathon_technologies

class TechnologyService:
    @staticmethod
    def get_or_create_technologies(db: Session, names: List[str]) -> List[Technology]:
        cleaned = []
        seen = set()
        for n in names:
            if isinstance(n, str):
                s = n.strip()
                lower_s = s.lower()
                if s and lower_s not in seen:
                    cleaned.append(s)
                    seen.add(lower_s)

        if not cleaned:
            return []

        result = []
        for name in cleaned:
            existing = (
                db.query(Technology)
                .filter(func.lower(Technology.name) == name.lower())
                .first()
            )
            if existing:
                result.append(existing)
            else:
                new_tech = Technology(name=name)
                db.add(new_tech)
                db.flush()
                result.append(new_tech)

        return result

    @staticmethod
    def search(db: Session, query: Optional[str] = None) -> List[Technology]:
        q = db.query(Technology)
        if query and query.strip():
            search_str = f"%{query.strip().lower()}%"
            q = q.filter(func.lower(Technology.name).like(search_str))
        return q.order_by(Technology.name.asc()).all()

    @staticmethod
    def delete(db: Session, tech_id: int) -> None:
        tech = db.query(Technology).filter(Technology.id == tech_id).first()
        if not tech:
            raise HTTPException(status_code=404, detail="Technology not found")

        # Check if used in projects or hackathons
        in_projects = db.execute(
            select(project_technologies.c.project_id).where(project_technologies.c.technology_id == tech_id)
        ).first()
        in_hackathons = db.execute(
            select(hackathon_technologies.c.hackathon_id).where(hackathon_technologies.c.technology_id == tech_id)
        ).first()

        if in_projects or in_hackathons:
            raise HTTPException(
                status_code=409,
                detail="Cannot delete technology that is currently used by a project or hackathon",
            )

        db.delete(tech)
        db.commit()

