from datetime import date, datetime, timedelta
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

TEXT_SECTIONS = [
    "completed",
    "learned",
    "went_wrong",
    "could_improve",
    "important_events",
    "reflections",
    "tomorrow_priorities",
]

def clean_text_field(v: Any) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, str):
        trimmed = v.strip()
        return trimmed if trimmed else None
    return str(v)

def parse_optional_int(v: Any, min_val: int, max_val: int, field_name: str) -> Optional[int]:
    if v is None or v == "":
        return None
    try:
        val = int(v)
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be an integer")
    if val < min_val or val > max_val:
        raise ValueError(f"{field_name} must be between {min_val} and {max_val}")
    return val

def parse_optional_float(v: Any, min_val: float, max_val: float, field_name: str) -> Optional[float]:
    if v is None or v == "":
        return None
    try:
        val = float(v)
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be a number")
    if val < min_val or val > max_val:
        raise ValueError(f"{field_name} must be between {min_val} and {max_val}")
    return val

def validate_not_future_date(v: date) -> date:
    # Use server local time, allowing 1 day into future for timezone tolerance
    local_today = datetime.now().date()
    max_allowed = local_today + timedelta(days=1)
    if v > max_allowed:
        raise ValueError("Entry date cannot be more than 1 day in the future")
    return v

class JournalCreate(BaseModel):
    entry_date: date
    completed: Optional[str] = None
    learned: Optional[str] = None
    went_wrong: Optional[str] = None
    could_improve: Optional[str] = None
    important_events: Optional[str] = None
    reflections: Optional[str] = None
    tomorrow_priorities: Optional[str] = None
    mood: Optional[int] = None
    energy: Optional[int] = None
    sleep_hours: Optional[float] = None

    @field_validator("entry_date", mode="before")
    @classmethod
    def clean_entry_date(cls, v: Any) -> Any:
        if isinstance(v, str):
            trimmed = v.strip()
            return date.fromisoformat(trimmed)
        return v

    @field_validator("entry_date")
    @classmethod
    def check_date(cls, v: date) -> date:
        return validate_not_future_date(v)

    @field_validator(*TEXT_SECTIONS, mode="before")
    @classmethod
    def clean_text(cls, v: Any) -> Optional[str]:
        return clean_text_field(v)

    @field_validator("mood", mode="before")
    @classmethod
    def clean_mood(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v, 1, 5, "Mood")

    @field_validator("energy", mode="before")
    @classmethod
    def clean_energy(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v, 1, 5, "Energy")

    @field_validator("sleep_hours", mode="before")
    @classmethod
    def clean_sleep(cls, v: Any) -> Optional[float]:
        return parse_optional_float(v, 0.0, 24.0, "Sleep hours")

    @model_validator(mode="after")
    def check_at_least_one_text_section(self):
        has_text = any(
            getattr(self, sec) is not None for sec in TEXT_SECTIONS
        )
        if not has_text:
            raise ValueError("Write at least one section")
        return self

class JournalUpdate(BaseModel):
    entry_date: Optional[date] = None
    completed: Optional[str] = None
    learned: Optional[str] = None
    went_wrong: Optional[str] = None
    could_improve: Optional[str] = None
    important_events: Optional[str] = None
    reflections: Optional[str] = None
    tomorrow_priorities: Optional[str] = None
    mood: Optional[int] = None
    energy: Optional[int] = None
    sleep_hours: Optional[float] = None

    @field_validator("entry_date", mode="before")
    @classmethod
    def clean_entry_date(cls, v: Any) -> Any:
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            trimmed = v.strip()
            return date.fromisoformat(trimmed)
        return v

    @field_validator("entry_date")
    @classmethod
    def check_date(cls, v: Optional[date]) -> Optional[date]:
        if v is not None:
            return validate_not_future_date(v)
        return v

    @field_validator(*TEXT_SECTIONS, mode="before")
    @classmethod
    def clean_text(cls, v: Any) -> Optional[str]:
        return clean_text_field(v)

    @field_validator("mood", mode="before")
    @classmethod
    def clean_mood(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v, 1, 5, "Mood")

    @field_validator("energy", mode="before")
    @classmethod
    def clean_energy(cls, v: Any) -> Optional[int]:
        return parse_optional_int(v, 1, 5, "Energy")

    @field_validator("sleep_hours", mode="before")
    @classmethod
    def clean_sleep(cls, v: Any) -> Optional[float]:
        return parse_optional_float(v, 0.0, 24.0, "Sleep hours")

class JournalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entry_date: date
    completed: Optional[str] = None
    learned: Optional[str] = None
    went_wrong: Optional[str] = None
    could_improve: Optional[str] = None
    important_events: Optional[str] = None
    reflections: Optional[str] = None
    tomorrow_priorities: Optional[str] = None
    mood: Optional[int] = None
    energy: Optional[int] = None
    sleep_hours: Optional[float] = None
    created_at: datetime
    updated_at: datetime
