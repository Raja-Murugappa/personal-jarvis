from sqlalchemy import Column, String, Text, Boolean, Date, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
from app.models.technology import project_technologies

class Project(Base, TimestampMixin):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_projects_date_order",
        ),
    )

    title = Column(String(150), nullable=False)
    headline = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    problem_statement = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="idea", nullable=False, index=True)  # idea, in_progress, completed, paused
    start_date = Column(Date, nullable=True, index=True)
    end_date = Column(Date, nullable=True)
    my_contribution = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    future_improvements = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    archived_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # Relationships
    technologies = relationship(
        "Technology",
        secondary=project_technologies,
        backref="projects",
        lazy="selectin",
    )
    team_members = relationship(
        "TeamMember",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
    links = relationship(
        "Link",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Link.sort_order",
        lazy="selectin",
    )
    attachments = relationship(
        "Attachment",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Attachment.sort_order",
        lazy="selectin",
    )
    hackathons = relationship(
        "Hackathon",
        back_populates="project",
        lazy="selectin",
    )

