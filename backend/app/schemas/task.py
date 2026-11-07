from enum import Enum
from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

def normalize_empty_string(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, str):
        trimmed = v.strip()
        return trimmed if trimmed else None
    return v

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[date] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Title cannot be empty or whitespace only")
        if len(trimmed) > 200:
            raise ValueError("Title cannot exceed 200 characters")
        return trimmed

    @field_validator("description", "category", mode="before")
    @classmethod
    def clean_text_fields(cls, v: Any) -> Any:
        return normalize_empty_string(v)

    @field_validator("due_date", mode="before")
    @classmethod
    def clean_due_date(cls, v: Any) -> Any:
        if v == "" or v is None:
            return None
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Title cannot be empty or whitespace only")
            if len(trimmed) > 200:
                raise ValueError("Title cannot exceed 200 characters")
            return trimmed
        return v

    @field_validator("description", "category", mode="before")
    @classmethod
    def clean_text_fields(cls, v: Any) -> Any:
        return normalize_empty_string(v)

    @field_validator("due_date", mode="before")
    @classmethod
    def clean_due_date(cls, v: Any) -> Any:
        if v == "" or v is None:
            return None
        return v

class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    category: Optional[str] = None
    due_date: Optional[date] = None
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
