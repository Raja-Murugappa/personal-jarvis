from datetime import date
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.journal import JournalEntry
from app.schemas.journal import JournalCreate, JournalUpdate, TEXT_SECTIONS

class JournalService:
    @staticmethod
    def get_entries(
        db: Session,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[JournalEntry]:
        query = db.query(JournalEntry)
        if from_date:
            query = query.filter(JournalEntry.entry_date >= from_date)
        if to_date:
            query = query.filter(JournalEntry.entry_date <= to_date)
        return query.order_by(JournalEntry.entry_date.desc(), JournalEntry.id.desc()).all()

    @staticmethod
    def get_entry_by_id(db: Session, entry_id: int) -> Optional[JournalEntry]:
        return db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()

    @staticmethod
    def get_entry_by_date(db: Session, entry_date: date) -> Optional[JournalEntry]:
        return db.query(JournalEntry).filter(JournalEntry.entry_date == entry_date).first()

    @staticmethod
    def create_entry(db: Session, entry_in: JournalCreate) -> JournalEntry:
        db_entry = JournalEntry(
            entry_date=entry_in.entry_date,
            completed=entry_in.completed,
            learned=entry_in.learned,
            went_wrong=entry_in.went_wrong,
            could_improve=entry_in.could_improve,
            important_events=entry_in.important_events,
            reflections=entry_in.reflections,
            tomorrow_priorities=entry_in.tomorrow_priorities,
            mood=entry_in.mood,
            energy=entry_in.energy,
            sleep_hours=entry_in.sleep_hours,
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry

    @staticmethod
    def update_entry(db: Session, entry: JournalEntry, entry_in: JournalUpdate) -> JournalEntry:
        update_data = entry_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(entry, field, value)

        # Validate that the merged entry still has at least one non-empty text section
        has_text = any(
            getattr(entry, sec) is not None and getattr(entry, sec).strip() != ""
            for sec in TEXT_SECTIONS
        )
        if not has_text:
            raise ValueError("Write at least one section")

        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def delete_entry(db: Session, entry: JournalEntry) -> None:
        db.delete(entry)
        db.commit()
