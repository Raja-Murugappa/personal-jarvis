from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

class TeamMemberInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    role: Optional[str] = Field(None, max_length=150)
    linkedin_url: Optional[str] = Field(None, max_length=500)

    @field_validator("name", "role", "linkedin_url", mode="before")
    @classmethod
    def clean_strings(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

class TeamMemberRead(BaseModel):
    id: int
    name: str
    role: Optional[str] = None
    linkedin_url: Optional[str] = None
    project_id: Optional[int] = None
    hackathon_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
