from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

AttachmentKind = Literal["image", "document", "certificate"]

class AttachmentRead(BaseModel):
    id: int
    kind: str
    original_name: str
    stored_name: str
    mime_type: str
    size_bytes: int
    width: Optional[int] = None
    height: Optional[int] = None
    caption: Optional[str] = None
    alt_text: Optional[str] = None
    sort_order: int
    is_cover: bool
    project_id: Optional[int] = None
    hackathon_id: Optional[int] = None
    created_at: datetime
    file_url: str = ""
    thumbnail_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AttachmentUpdate(BaseModel):
    caption: Optional[str] = Field(None, max_length=255)
    alt_text: Optional[str] = Field(None, max_length=255)
    sort_order: Optional[int] = None
    is_cover: Optional[bool] = None
