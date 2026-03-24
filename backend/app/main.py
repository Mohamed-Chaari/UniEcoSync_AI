from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlmodel import Session, select

from app.routers import relocation, weather, report, leaderboard, schedule
from app.models.database import create_db_and_tables, engine, User
import asyncio
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(title="UniEcoSync AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(relocation.router)
app.include_router(weather.router)
app.include_router(report.router)
app.include_router(leaderboard.router)
app.include_router(schedule.router)

async def background_sync_task():
    while True:
        now = datetime.now()
        # Find next Monday 00:00
        days_ahead = 0 - now.weekday()
        if days_ahead <= 0:
            days_ahead += 7

        next_monday = now + timedelta(days_ahead)
        next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)

        sleep_seconds = (next_monday - now).total_seconds()
        print(f"Next CSV sync scheduled in {sleep_seconds} seconds (at {next_monday})")

        await asyncio.sleep(sleep_seconds)

        # Trigger the sync
        print("Running scheduled CSV sync...")
        with Session(engine) as session:
            schedule.sync_csv_to_db(session)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

    with Session(engine) as session:
        statement = select(User)
        users = session.exec(statement).all()
        if not users:
            seed_users = [
                User(name="Ahmed", eco_points=20),
                User(name="Fatma", eco_points=40),
                User(name="Mohamed Chaari", eco_points=0),
            ]
            session.add_all(seed_users)
            session.commit()

        # Initial sync on startup
        print("Running initial CSV sync on startup...")
        schedule.sync_csv_to_db(session)

    # Start the background task
    asyncio.create_task(background_sync_task())

@app.get("/")
def read_root():
    return {"status": "UniEcoSync AI backend is live"}
