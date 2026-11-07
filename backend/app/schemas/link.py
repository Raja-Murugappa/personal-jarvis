from typing import Optional, Literal
from urllib.parse import urlparse
from pydantic import BaseModel, Field, field_validator, ConfigDict

LinkKind = Literal[
    "github",
    "demo",
    "linkedin",
    "video",
    "documentation",
    "certificate",
    "dataset",
    "other",
]

class LinkInput(BaseModel):
    label: Optional[str] = Field(None, max_length=150)
    url: str = Field(..., max_length=2000)
    kind: LinkKind = "other"
    sort_order: int = 0

    @field_validator("label", mode="before")
    @classmethod
    def clean_label(cls, v):
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        parsed = urlparse(v)
        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError("Only http and https URLs are permitted")
        if not parsed.netloc:
            raise ValueError("Invalid URL: missing host")
        return v

    @field_validator("kind")
    @classmethod
    def validate_kind(cls, v: str, info) -> str:
        # If url was valid, check github host
        url = info.data.get("url")
        if v == "github" and url:
            parsed = urlparse(url)
            host = parsed.netloc.lower()
            if host != "github.com" and not host.endswith(".github.com"):
                raise ValueError("GitHub links must have host github.com")
        return v

class LinkRead(BaseModel):
    id: int
    label: Optional[str] = None
    url: str
    kind: str
    sort_order: int
    project_id: Optional[int] = None
    hackathon_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
