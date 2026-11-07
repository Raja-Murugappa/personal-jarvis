from sqlalchemy import Column, String, Text, Boolean, Date, DateTime, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin
from app.models.technology import hackathon_technologies

class Hackathon(Base, TimestampMixin):
    __tablename__ = "hackathons"
    __table_args__ = (
        CheckConstraint(
            "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
            name="ck_hackathons_date_order",
        ),
    )

    name = Column(String(150), nullable=False)
    organiser = Column(String(150), nullable=True)
    start_date = Column(Date, nullable=True, index=True)
    end_date = Column(Date, nullable=True)
    mode = Column(String(50), default="online", nullable=False)  # online, offline, hybrid
    location = Column(String(150), nullable=True)
    problem_statement_id = Column(String(100), nullable=True)
    problem_statement = Column(Text, nullable=True)
    team_name = Column(String(150), nullable=True)
    my_role = Column(String(150), nullable=True)
    submission_summary = Column(Text, nullable=True)
    result = Column(String(50), default="participated", nullable=False, index=True)  # participated, shortlisted, finalist, runner_up, winner, other
    result_detail = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    archived_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # Relationships
    project = relationship("Project", back_populates="hackathons")
    technologies = relationship(
        "Technology",
        secondary=hackathon_technologies,
        backref="hackathons",
        lazy="selectin",
    )
    team_members = relationship(
        "TeamMember",
        back_populates="hackathon",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
    links = relationship(
        "Link",
        back_populates="hackathon",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Link.sort_order",
        lazy="selectin",
    )
    attachments = relationship(
        "Attachment",
        back_populates="hackathon",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Attachment.sort_order",
        lazy="selectin",
    )

