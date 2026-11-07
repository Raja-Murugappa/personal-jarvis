from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Attachment(Base):
    __tablename__ = "attachments"
    __table_args__ = (
        CheckConstraint(
            "((project_id IS NOT NULL AND hackathon_id IS NULL) OR (project_id IS NULL AND hackathon_id IS NOT NULL))",
            name="ck_attachments_one_parent",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    kind = Column(String(50), nullable=False)  # image, document, certificate
    original_name = Column(String(200), nullable=False)
    stored_name = Column(String(100), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    caption = Column(String(255), nullable=True)
    alt_text = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    is_cover = Column(Boolean, default=False, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=True, index=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    project = relationship("Project", back_populates="attachments")
    hackathon = relationship("Hackathon", back_populates="attachments")

