from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base

class Link(Base):
    __tablename__ = "links"
    __table_args__ = (
        CheckConstraint(
            "((project_id IS NOT NULL AND hackathon_id IS NULL) OR (project_id IS NULL AND hackathon_id IS NOT NULL))",
            name="ck_links_one_parent",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String(150), nullable=True)
    url = Column(String(2000), nullable=False)
    kind = Column(String(50), nullable=False)  # github, demo, linkedin, video, documentation, certificate, dataset, other
    sort_order = Column(Integer, default=0, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=True, index=True)

    project = relationship("Project", back_populates="links")
    hackathon = relationship("Hackathon", back_populates="links")

