import random
from typing import Optional
from app.models.schemas import WeatherAlert, Severity

def get_weather_alert(scenario: Optional[str] = None) -> WeatherAlert:
    scenarios = {
        "rain": WeatherAlert(
            condition="Heavy Rain Forecast",
            temperature_c=16.0,
            humidity_percent=89,
            severity=Severity.high,
            sustainability_actions=[
                "Suspend all campus irrigation systems immediately",
                "Activate covered walkway lighting",
                "Send flood-risk alert to facilities team",
                "Recommend indoor route to students via app"
            ]
        ),
        "heatwave": WeatherAlert(
            condition="Extreme Heat Warning",
            temperature_c=41.0,
            humidity_percent=22,
            severity=Severity.high,
            sustainability_actions=[
                "Pre-cool lecture halls 30 mins before sessions",
                "Enable max ventilation in labs",
                "Issue hydration advisory to all students",
                "Defer outdoor maintenance to evening"
            ]
        ),
        "clear": WeatherAlert(
            condition="Clear Sky",
            temperature_c=24.0,
            humidity_percent=45,
            severity=Severity.low,
            sustainability_actions=[
                "Optimal conditions for natural ventilation — disable mechanical cooling in corridors",
                "Enable solar panel monitoring dashboard",
                "Green light for all outdoor campus activities"
            ]
        )
    }

    if scenario and scenario in scenarios:
        return scenarios[scenario]

    return random.choice(list(scenarios.values()))
