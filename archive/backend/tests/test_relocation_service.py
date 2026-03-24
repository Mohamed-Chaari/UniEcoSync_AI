import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.relocation_service import suggest_relocation
from app.models.database import WeeklySchedule

@patch('app.services.relocation_service.suggest_relocation_ai')
@patch('app.services.relocation_service.datetime')
def test_suggest_relocation_filters_labs_and_calls_ai(mock_datetime, mock_ai):
    mock_session = MagicMock()
    # Mock datetime to always return Monday 10:00
    mock_datetime.now.return_value.weekday.return_value = 0
    mock_datetime.now.return_value.strftime.return_value = "10:00"

    # Mock the DB to return master list first, then occupied list
    mock_session.exec.return_value.all.side_effect = [
        [
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="Classroom 101", capacity=50),
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="Science Lab A", capacity=60),
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="CR-404", capacity=20),
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="Occupied Room", capacity=50),
        ],
        [
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="Occupied Room", capacity=50),
        ]
    ]

    mock_ai.return_value = {
        "suggested_room_name": "Classroom 101",
        "capacity": 50,
        "energy_saving_estimate_kwh": 7.5,
        "action_items": [],
        "message": "Optimal."
    }

    result = suggest_relocation("AMP-A1", 30, mock_session)

    assert result.suggested_room_name == "Classroom 101"

    # Verify AI was called with the correct available rooms (labs excluded, capacity >= attendance)
    mock_ai.assert_called_once()
    available_rooms_passed_to_ai = mock_ai.call_args[0][0]

    assert len(available_rooms_passed_to_ai) == 1
    assert available_rooms_passed_to_ai[0]["room_name"] == "Classroom 101"

@patch('app.services.relocation_service.datetime')
def test_suggest_relocation_no_suitable_rooms(mock_datetime):
    mock_session = MagicMock()
    # Mock datetime to always return Monday 10:00
    mock_datetime.now.return_value.weekday.return_value = 0
    mock_datetime.now.return_value.strftime.return_value = "10:00"

    # Mock DB to return only rooms that are too small or labs
    mock_session.exec.return_value.all.side_effect = [
        [
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="Science Lab A", capacity=60),
            WeeklySchedule(day="Lundi", start_time="08:00", end_time="12:00", room_name="CR-404", capacity=20),
        ],
        []
    ]

    with pytest.raises(HTTPException) as exc_info:
        suggest_relocation("AMP-A1", 30, mock_session)

    assert exc_info.value.status_code == 404
    assert "No suitable" in exc_info.value.detail
