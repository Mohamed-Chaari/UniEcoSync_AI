from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from sqlalchemy import desc

from app.models.database import User, get_session
from app.models.schemas import UserResponse

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/", response_model=List[UserResponse])
def get_leaderboard(session: Session = Depends(get_session)):
    statement = select(User).order_by(desc(User.eco_points))
    results = session.exec(statement).all()
    return results
