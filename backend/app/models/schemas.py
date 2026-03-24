from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class RelocationRequest(BaseModel):
    room_id: str
    attendance_count: int

class RelocationSuggestion(BaseModel):
    suggested_room_id: str
    suggested_room_name: str
    capacity: int
    energy_saving_estimate_kwh: float
    action_items: List[str]
    message: str

class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class WeatherAlert(BaseModel):
    condition: str
    temperature_c: float
    humidity_percent: int
    sustainability_actions: List[str]
    severity: Severity

class UserResponse(BaseModel):
    id: int
    name: str
    eco_points: int

class ReportResponse(BaseModel):
    id: int
    type: str
    description: str
    location: str
    priority: str
    ai_analysis: str
    created_at: str

class AdminReportsResponse(BaseModel):
    reports: List[ReportResponse]
    total_count: int
