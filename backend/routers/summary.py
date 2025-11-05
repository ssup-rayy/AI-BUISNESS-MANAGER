from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MeetingText(BaseModel):
    text: str

@router.post("/summarize")
def summarize_meeting(data: MeetingText):
    summary = data.text[:100] + "..."
    return {"summary": summary}
