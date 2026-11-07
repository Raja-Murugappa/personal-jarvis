from typing import Optional, List, Literal
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from app.schemas.technology import TechnologyRead
from app.schemas.team_member import TeamMemberInput, TeamMemberRead
from app.schemas.link import LinkInput, LinkRead
from app.schemas.attachment import AttachmentRead

HackathonMode = Literal["online", "offline", "hybrid"]
HackathonResult = Literal["participated", "shortlisted", "finalist", "runner_up", "winner", "other"]

class HackathonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    organiser: Optional[str] = Field(None, max_length=150)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    mode: HackathonMode = "online"
    location: Optional[str] = Field(None, max_length=150)
    problem_statement_id: Optional[str] = Field(None, max_length=100)
    problem_statement: Optional[str] = None
    team_name: Optional[str] = Field(None, max_length=150)
    my_role: Optional[str] = Field(None, max_length=150)
    submission_summary: Optional[str] = None
    result: HackathonResult = "participated"
    result_detail: Optional[str] = None
    feedback: Optional[str] = None
    lessons_learned: Optional[str] = None
    notes: Optional[str] = None
    is_featured: bool = False
    project_id: Optional[int] = None

    @field_validator(
        "name",
        "organiser",
        "location",
        "problem_statement_id",
        "problem_statement",
        "team_name",
        "my_role",
        "submission_summary",
        "result_detail",
        "feedback",
        "lessons_learned",
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

class HackathonCreate(HackathonBase):
    technologies: List[str] = Field(default_factory=list)
    team_members: List[TeamMemberInput] = Field(default_factory=list)
    links: List[LinkInput] = Field(default_factory=list)

class HackathonUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    organiser: Optional[str] = Field(None, max_length=150)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    mode: Optional[HackathonMode] = None
    location: Optional[str] = Field(None, max_length=150)
    problem_statement_id: Optional[str] = Field(None, max_length=100)
    problem_statement: Optional[str] = None
    team_name: Optional[str] = Field(None, max_length=150)
    my_role: Optional[str] = Field(None, max_length=150)
    submission_summary: Optional[str] = None
    result: Optional[HackathonResult] = None
    result_detail: Optional[str] = None
    feedback: Optional[str] = None
    lessons_learned: Optional[str] = None
    notes: Optional[str] = None
    is_featured: Optional[bool] = None
    project_id: Optional[int] = None

    technologies: Optional[List[str]] = None
    team_members: Optional[List[TeamMemberInput]] = None
    links: Optional[List[LinkInput]] = None

    @field_validator(
        "name",
        "organiser",
        "location",
        "problem_statement_id",
        "problem_statement",
        "team_name",
        "my_role",
        "submission_summary",
        "result_detail",
        "feedback",
        "lessons_learned",
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

class ProjectShortRead(BaseModel):
    id: int
    title: str
    headline: Optional[str] = None
    status: str
    model_config = ConfigDict(from_attributes=True)

class HackathonListRead(BaseModel):
    id: int
    name: str
    organiser: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    mode: str
    location: Optional[str] = None
    my_role: Optional[str] = None
    result: str
    is_featured: bool
    archived_at: Optional[datetime] = None
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    cover_thumbnail_url: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    link_count: int = 0
    attachment_count: int = 0
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class HackathonDetailRead(HackathonBase):
    id: int
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    project: Optional[ProjectShortRead] = None
    technologies: List[TechnologyRead] = Field(default_factory=list)
    team_members: List[TeamMemberRead] = Field(default_factory=list)
    links: List[LinkRead] = Field(default_factory=list)
    attachments: List[AttachmentRead] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)
