from pydantic import BaseModel, Field, field_validator, ConfigDict

class TechnologyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Technology name cannot be empty")
            return v
        return v

class TechnologyCreate(TechnologyBase):
    pass

class TechnologyRead(TechnologyBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
