from sqlalchemy import Column, String, Text, Date
from app.models.base import Base, TimestampMixin

class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="medium")
    category = Column(String(100), nullable=True)
    due_date = Column(Date, nullable=True, index=True)
    status = Column(String(20), nullable=False, default="todo", index=True)
