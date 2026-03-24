from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, create_engine, Session

class Anomaly(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    description: str
    location: str
    priority: str = Field(default="Low")
    ai_analysis: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    eco_points: int = Field(default=0)

class WeeklySchedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    day: str
    start_time: str
    end_time: str
    room_name: str
    capacity: int

sqlite_file_name = "uniecosync.db"
sqlite_url = f"sqlite:///./{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
