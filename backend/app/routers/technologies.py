from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.technology import TechnologyRead
from app.services.technology_service import TechnologyService

router = APIRouter(prefix="/technologies", tags=["technologies"])

@router.get("", response_model=List[TechnologyRead])
def get_technologies(
    search: Optional[str] = Query(None, description="Search technologies by name"),
    db: Session = Depends(get_db),
):
    return TechnologyService.search(db, query=search)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology(id: int, db: Session = Depends(get_db)):
    TechnologyService.delete(db, tech_id=id)

