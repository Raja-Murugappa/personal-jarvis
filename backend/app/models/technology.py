from sqlalchemy import Column, Integer, String, Table, ForeignKey
from app.models.base import Base

project_technologies = Table(
    "project_technologies",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
)

hackathon_technologies = Table(
    "hackathon_technologies",
    Base.metadata,
    Column("hackathon_id", Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True),
)

class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

