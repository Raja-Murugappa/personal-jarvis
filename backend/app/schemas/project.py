from typing import Optional, List, Literal
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from app.schemas.technology import TechnologyRead
from app.schemas.team_member import TeamMemberInput, TeamMemberRead
from app.schemas.link import LinkInput, LinkRead
from app.schemas.attachment import AttachmentRead

ProjectStatus = Literal["idea", "in_progress", "completed", "paused"]

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    headline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    status: ProjectStatus = "idea"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    my_contribution: Optional[str] = None
    challenges: Optional[str] = None
    lessons_learned: Optional[str] = None
    future_improvements: Optional[str] = None
    notes: Optional[str] = None
    is_featured: bool = False

    @field_validator(
        "title",
        "headline",
        "description",
        "problem_statement",
        "category",
        "my_contribution",
        "challenges",
        "lessons_learned",
        "future_improvements",
        "notes",
        mode="before",
    )
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than start date")
        return self

class ProjectCreate(ProjectBase):
    technologies: List[str] = Field(default_factory=list)
    team_members: List[TeamMemberInput] = Field(default_factory=list)
    links: List[LinkInput] = Field(default_factory=list)

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    headline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    status: Optional[ProjectStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    my_contribution: Optional[str] = None
    challenges: Optional[str] = None
    lessons_learned: Optional[str] = None
    future_improvements: Optional[str] = None
    notes: Optional[str] = None
    is_featured: Optional[bool] = None

    technologies: Optional[List[str]] = None
    team_members: Optional[List[TeamMemberInput]] = None
    links: Optional[List[LinkInput]] = None

    @field_validator(
        "title",
        "headline",
        "description",
        "problem_statement",
        "category",
        "my_contribution",
        "challenges",
        "lessons_learned",
        "future_improvements",
        "notes",
        mode="before",
    )
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot be earlier than start date")
        return self

class ProjectListRead(BaseModel):
    id: int
    title: str
    headline: Optional[str] = None
    category: Optional[str] = None
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_featured: bool
    archived_at: Optional[datetime] = None
    cover_thumbnail_url: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    link_count: int = 0
    attachment_count: int = 0
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HackathonShortRead(BaseModel):
    id: int
    name: str
    organiser: Optional[str] = None
    start_date: Optional[date] = None
    result: str
    is_featured: bool
    model_config = ConfigDict(from_attributes=True)

class ProjectDetailRead(ProjectBase):
    id: int
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    technologies: List[TechnologyRead] = Field(default_factory=list)
    team_members: List[TeamMemberRead] = Field(default_factory=list)
    links: List[LinkRead] = Field(default_factory=list)
    attachments: List[AttachmentRead] = Field(default_factory=list)
    hackathons: List[HackathonShortRead] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)
