from pydantic import BaseModel

class ShowcaseRead(BaseModel):
    linkedin_text: str
    markdown: str

