from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.schemas import RelocationSuggestion
from app.models.database import WeeklySchedule
from app.services.gemini_service import suggest_relocation_ai
from datetime import datetime

def suggest_relocation(room_id: str, attendance_count: int, session: Session) -> RelocationSuggestion:
    statement = select(WeeklySchedule)
    all_rooms = session.exec(statement).all()

    master_list = {}
    for r in all_rooms:
        master_list[r.room_name] = r.capacity

    days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    now = datetime.now()
    current_day = days[now.weekday()]
    current_time = now.strftime("%H:%M")

    occupied_statement = select(WeeklySchedule).where(
        WeeklySchedule.day == current_day,
        WeeklySchedule.start_time <= current_time,
        WeeklySchedule.end_time >= current_time
    )
    occupied_records = session.exec(occupied_statement).all()
    occupied_room_names = {r.room_name for r in occupied_records}

    available_rooms = []
    for room_name, capacity in master_list.items():
        if room_name not in occupied_room_names:
            if "lab" not in room_name.lower() and capacity >= attendance_count:
                available_rooms.append({
                    "room_name": room_name,
                    "capacity": capacity
                })

    if not available_rooms:
        raise HTTPException(status_code=404, detail="No suitable, more efficient room found for this attendance size.")

    # Call Gemini
    ai_result = suggest_relocation_ai(available_rooms, attendance_count, room_id)

    if not ai_result:
        raise HTTPException(status_code=500, detail="Error generating AI relocation suggestion.")

    return RelocationSuggestion(
        suggested_room_id="AI-SUGGESTED", # We don't have IDs in the prompt, so mock it
        suggested_room_name=ai_result["suggested_room_name"],
        capacity=ai_result["capacity"],
        energy_saving_estimate_kwh=ai_result["energy_saving_estimate_kwh"],
        action_items=ai_result["action_items"],
        message=ai_result["message"]
    )
