from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.models.base import Base

class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (
        CheckConstraint(
            "((project_id IS NOT NULL AND hackathon_id IS NULL) OR (project_id IS NULL AND hackathon_id IS NOT NULL))",
            name="ck_team_members_one_parent",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    role = Column(String(150), nullable=True)
    linkedin_url = Column(String(500), nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=True, index=True)

    project = relationship("Project", back_populates="team_members")
    hackathon = relationship("Hackathon", back_populates="team_members")

