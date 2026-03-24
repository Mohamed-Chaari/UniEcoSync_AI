from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.models.schemas import RelocationRequest, RelocationSuggestion
from app.services.relocation_service import suggest_relocation
from app.models.database import get_session

router = APIRouter(prefix="/api/relocation", tags=["Relocation"])

@router.post("/", response_model=RelocationSuggestion)
def get_relocation_suggestion(request: RelocationRequest, session: Session = Depends(get_session)):
    return suggest_relocation(request.room_id, request.attendance_count, session)
