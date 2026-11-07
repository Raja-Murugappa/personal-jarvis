from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.journal import JournalCreate, JournalUpdate, JournalRead
from app.services.journal_service import JournalService

router = APIRouter(prefix="/journal", tags=["journal"])

@router.get("", response_model=List[JournalRead], status_code=status.HTTP_200_OK)
def list_journal_entries(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
):
    return JournalService.get_entries(db=db, from_date=from_date, to_date=to_date)

@router.get("/{journal_id}", response_model=JournalRead, status_code=status.HTTP_200_OK)
def get_journal_entry(
    journal_id: int,
    db: Session = Depends(get_db),
):
    entry = JournalService.get_entry_by_id(db=db, entry_id=journal_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with id {journal_id} not found",
        )
    return entry

@router.post("", response_model=JournalRead, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_in: JournalCreate,
    db: Session = Depends(get_db),
):
    existing = JournalService.get_entry_by_date(db=db, entry_date=entry_in.entry_date)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An entry for this date already exists",
        )
    return JournalService.create_entry(db=db, entry_in=entry_in)

@router.put("/{journal_id}", response_model=JournalRead, status_code=status.HTTP_200_OK)
def update_journal_entry(
    journal_id: int,
    entry_in: JournalUpdate,
    db: Session = Depends(get_db),
):
    entry = JournalService.get_entry_by_id(db=db, entry_id=journal_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with id {journal_id} not found",
        )

    if entry_in.entry_date is not None and entry_in.entry_date != entry.entry_date:
        existing = JournalService.get_entry_by_date(db=db, entry_date=entry_in.entry_date)
        if existing and existing.id != journal_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An entry for this date already exists",
            )

    try:
        return JournalService.update_entry(db=db, entry=entry, entry_in=entry_in)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err),
        )

@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    journal_id: int,
    db: Session = Depends(get_db),
):
    entry = JournalService.get_entry_by_id(db=db, entry_id=journal_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal entry with id {journal_id} not found",
        )
    JournalService.delete_entry(db=db, entry=entry)
    return None
