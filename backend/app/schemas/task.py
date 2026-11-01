from enum import Enum
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[date] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None

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
