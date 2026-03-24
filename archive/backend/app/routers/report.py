from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy import desc

from app.models.database import Anomaly, User, get_session
from app.services.gemini_service import analyze_report

router = APIRouter(prefix="/api/report", tags=["report"])

class ReportRequest(BaseModel):
    type: str
    description: str
    location: str

# IMPORTANT: Need to import `python-multipart` to support Form and File. This is normally added in requirements.txt.

@router.post("/issues/analyze")
async def analyze_issue(
    image: UploadFile = File(...),
    description: str = Form(...),
    student_id: str = Form(...),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    # Placeholder for Gemini vision processing (simulated for now based on text)
    # The actual implementation would read `await image.read()` and send it to Gemini vision model.
    try:
        # Pass description to Gemini for basic analysis (mocking image part for now unless implemented)
        ai_result = analyze_report(description)

        category = ai_result.get('category', 'Other')
        is_spam = ai_result.get('is_spam', False)

        if is_spam:
             return {
                "status": "rejected",
                "message": "Report flagged as spam.",
                "eco_points_awarded": 0
            }

        eco_points = 5  # Fixed points as per user request example

        # Optionally, save to DB using the student_id or create Anomaly.
        # But per requirements we only need to return the JSON response format
        return {
            "status": "success",
            "ai_category": category.lower(),
            "eco_points_awarded": eco_points
        }
    except Exception as e:
        print(f"Error during AI anomaly evaluation: {e}")
        return {
            "status": "error",
            "message": "Analysis failed",
            "eco_points_awarded": 0
        }

@router.post("/")
def create_report(request: ReportRequest, session: Session = Depends(get_session)) -> Anomaly:
    # 1. Call Gemini
    try:
        ai_result = analyze_report(request.description)

        # 2. Check if spam
        if ai_result.get('is_spam', False):
            raise HTTPException(status_code=400, detail="Spam detected. Report rejected.")

        priority = ai_result.get('priority', 'Medium')
        category = ai_result.get('category', 'Other')
        suggested_action = ai_result.get('suggested_action', 'Manual review required.')
        ai_analysis_str = f"[Category: {category}] {suggested_action}"

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during AI anomaly evaluation: {e}")
        # Graceful degradation
        priority = "Pending"
        ai_analysis_str = "System temporarily unavailable. Pending manual facility review."

    # 3. Create Anomaly object
    new_anomaly = Anomaly(
        type=request.type,
        description=request.description,
        location=request.location,
        priority=priority,
        ai_analysis=ai_analysis_str
    )

    # 4. Save to SQLite via session
    session.add(new_anomaly)

    # 5. Update Eco-Points for user "Mohamed Chaari"
    statement = select(User).where(User.name == "Mohamed Chaari")
    user = session.exec(statement).first()

    if user:
        user.eco_points += 10
    else:
        user = User(name="Mohamed Chaari", eco_points=10)
        session.add(user)

    session.commit()
    session.refresh(new_anomaly)

    # 6. Return response
    return new_anomaly

@router.get("/")
def get_reports(session: Session = Depends(get_session)) -> Dict[str, Any]:
    # Returns list of all Anomaly records ordered by created_at desc
    statement = select(Anomaly).order_by(desc(Anomaly.created_at))
    results = session.exec(statement).all()

    # Include total_count in response
    return {
        "reports": results,
        "total_count": len(results)
    }
