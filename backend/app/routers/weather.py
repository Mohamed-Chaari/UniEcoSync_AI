from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import WeatherAlert
from app.services.weather_service import get_weather_alert

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/", response_model=WeatherAlert)
def get_weather(scenario: Optional[str] = Query(None, description="Force a specific scenario: 'rain', 'heatwave', or 'clear'")):
    return get_weather_alert(scenario)
