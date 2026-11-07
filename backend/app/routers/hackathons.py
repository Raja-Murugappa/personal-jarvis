from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonListRead, HackathonDetailRead
from app.schemas.showcase import ShowcaseRead
from app.services.hackathon_service import HackathonService
from app.routers.attachments import format_attachment_read

router = APIRouter(prefix="/hackathons", tags=["hackathons"])

def format_hackathon_detail(hackathon) -> HackathonDetailRead:
    res = HackathonDetailRead.model_validate(hackathon)
    res.attachments = [format_attachment_read(a) for a in hackathon.attachments]
    return res

@router.get("", response_model=List[HackathonListRead])
def list_hackathons(
    result: Optional[str] = Query(None, description="Filter by result: participated, shortlisted, finalist, runner_up, winner, other"),
    year: Optional[int] = Query(None, description="Filter by year of start date"),
    technology: Optional[str] = Query(None, description="Filter by technology name"),
    featured: Optional[bool] = Query(None, description="Filter by is_featured"),
    search: Optional[str] = Query(None, description="Search in name, organiser, submission summary"),
    include_archived: bool = Query(False, description="Include archived hackathons"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return HackathonService.list(
        db=db,
        result=result,
        year=year,
        technology=technology,
        featured=featured,
        search=search,
        include_archived=include_archived,
        limit=limit,
        offset=offset,
    )

@router.post("", response_model=HackathonDetailRead, status_code=status.HTTP_201_CREATED)
def create_hackathon(data: HackathonCreate, db: Session = Depends(get_db)):
    hackathon = HackathonService.create(db, data)
    return format_hackathon_detail(hackathon)

@router.get("/{id}", response_model=HackathonDetailRead)
def get_hackathon(id: int, db: Session = Depends(get_db)):
    hackathon = HackathonService.get_by_id(db, id)
    return format_hackathon_detail(hackathon)

@router.put("/{id}", response_model=HackathonDetailRead)
def update_hackathon(id: int, data: HackathonUpdate, db: Session = Depends(get_db)):
    hackathon = HackathonService.update(db, id, data)
    return format_hackathon_detail(hackathon)

@router.post("/{id}/archive", response_model=HackathonDetailRead)
def archive_hackathon(id: int, db: Session = Depends(get_db)):
    hackathon = HackathonService.archive(db, id)
    return format_hackathon_detail(hackathon)

@router.post("/{id}/restore", response_model=HackathonDetailRead)
def restore_hackathon(id: int, db: Session = Depends(get_db)):
    hackathon = HackathonService.restore(db, id)
    return format_hackathon_detail(hackathon)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hackathon(id: int, db: Session = Depends(get_db)):
    HackathonService.delete(db, id)

@router.get("/{id}/showcase", response_model=ShowcaseRead)
def get_hackathon_showcase(id: int, db: Session = Depends(get_db)):
    hackathon = HackathonService.get_by_id(db, id)
    return HackathonService.generate_showcase(hackathon)

