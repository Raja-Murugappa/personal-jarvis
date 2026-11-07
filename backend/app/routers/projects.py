from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectListRead, ProjectDetailRead
from app.schemas.showcase import ShowcaseRead
from app.services.project_service import ProjectService
from app.routers.attachments import format_attachment_read

router = APIRouter(prefix="/projects", tags=["projects"])

def format_project_detail(project) -> ProjectDetailRead:
    res = ProjectDetailRead.model_validate(project)
    # Populate URLs on attachments
    res.attachments = [format_attachment_read(a) for a in project.attachments]
    return res

@router.get("", response_model=List[ProjectListRead])
def list_projects(
    status: Optional[str] = Query(None, description="Filter by status: idea, in_progress, completed, paused"),
    category: Optional[str] = Query(None, description="Filter by category"),
    technology: Optional[str] = Query(None, description="Filter by technology name"),
    featured: Optional[bool] = Query(None, description="Filter by is_featured"),
    search: Optional[str] = Query(None, description="Search in title, headline, description"),
    include_archived: bool = Query(False, description="Include archived projects"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return ProjectService.list(
        db=db,
        status=status,
        category=category,
        technology=technology,
        featured=featured,
        search=search,
        include_archived=include_archived,
        limit=limit,
        offset=offset,
    )

@router.post("", response_model=ProjectDetailRead, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = ProjectService.create(db, data)
    return format_project_detail(project)

@router.get("/{id}", response_model=ProjectDetailRead)
def get_project(id: int, db: Session = Depends(get_db)):
    project = ProjectService.get_by_id(db, id)
    return format_project_detail(project)

@router.put("/{id}", response_model=ProjectDetailRead)
def update_project(id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = ProjectService.update(db, id, data)
    return format_project_detail(project)

@router.post("/{id}/archive", response_model=ProjectDetailRead)
def archive_project(id: int, db: Session = Depends(get_db)):
    project = ProjectService.archive(db, id)
    return format_project_detail(project)

@router.post("/{id}/restore", response_model=ProjectDetailRead)
def restore_project(id: int, db: Session = Depends(get_db)):
    project = ProjectService.restore(db, id)
    return format_project_detail(project)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(id: int, db: Session = Depends(get_db)):
    ProjectService.delete(db, id)

@router.get("/{id}/showcase", response_model=ShowcaseRead)
def get_project_showcase(id: int, db: Session = Depends(get_db)):
    project = ProjectService.get_by_id(db, id)
    return ProjectService.generate_showcase(project)

