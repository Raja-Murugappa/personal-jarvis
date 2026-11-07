from sqlalchemy import Column, Integer, Float, Text, Date
from app.models.base import Base, TimestampMixin

class JournalEntry(Base, TimestampMixin):
    __tablename__ = "journal_entries"

    entry_date = Column(Date, unique=True, nullable=False, index=True)
    completed = Column(Text, nullable=True)
    learned = Column(Text, nullable=True)
    went_wrong = Column(Text, nullable=True)
    could_improve = Column(Text, nullable=True)
    important_events = Column(Text, nullable=True)
    reflections = Column(Text, nullable=True)
    tomorrow_priorities = Column(Text, nullable=True)
    mood = Column(Integer, nullable=True)
    energy = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
