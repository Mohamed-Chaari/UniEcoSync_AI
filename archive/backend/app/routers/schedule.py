from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlmodel import Session, select
import csv
import io
from datetime import datetime

from app.models.database import WeeklySchedule, get_session

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

import os

def sync_csv_to_db(session: Session):
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "emploi.csv")
    if not os.path.exists(csv_path):
        print(f"Warning: CSV file not found at {csv_path}")
        return

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            # Clear existing schedule
            statement = select(WeeklySchedule)
            existing_rooms = session.exec(statement).all()
            for room in existing_rooms:
                session.delete(room)

            # Parse and insert new records
            rooms_to_insert = []
            for row in reader:
                day = row.get('day')
                start_time = row.get('start_time')
                end_time = row.get('end_time')
                room_name = row.get('room_name')
                capacity = row.get('capacity')

                if not all([day, start_time, end_time, room_name, capacity]):
                    continue

                try:
                    cap = int(capacity)
                except ValueError:
                    continue

                rooms_to_insert.append(WeeklySchedule(
                    day=day.strip(),
                    start_time=start_time.strip(),
                    end_time=end_time.strip(),
                    room_name=room_name.strip(),
                    capacity=cap
                ))

            if rooms_to_insert:
                session.add_all(rooms_to_insert)
                session.commit()
                print(f"Successfully synced {len(rooms_to_insert)} rooms from CSV.")
            else:
                print("No valid data found in CSV.")

    except Exception as e:
        session.rollback()
        print(f"Error syncing CSV to DB: {str(e)}")


@router.get("/live")
def get_live_schedule(session: Session = Depends(get_session)):
    # Master list
    statement = select(WeeklySchedule)
    all_rooms = session.exec(statement).all()

    master_list = {}
    for r in all_rooms:
        master_list[r.room_name] = r.capacity

    # Map weekday integer to French day
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

    empty_rooms = []
    for room_name, capacity in master_list.items():
        if room_name not in occupied_room_names:
            empty_rooms.append({"room_name": room_name, "capacity": capacity})

    return {"rooms": empty_rooms}
