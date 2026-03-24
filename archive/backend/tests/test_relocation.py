import pytest
from unittest.mock import patch, MagicMock
from app.models.database import WeeklySchedule

@patch('app.routers.relocation.suggest_relocation')
def test_valid_relocation_success(mock_suggest, client):
    mock_suggest.return_value = {
        "suggested_room_id": "AI-SUGGESTED",
        "suggested_room_name": "CR-101",
        "capacity": 60,
        "energy_saving_estimate_kwh": 5.0,
        "action_items": [],
        "message": "AI rules"
    }
    response = client.post("/api/relocation/", json={"room_id": "AMP-A1", "attendance_count": 50})
    assert response.status_code == 200
    data = response.json()
    assert "suggested_room_id" in data
    assert data["capacity"] >= 50
    assert data["energy_saving_estimate_kwh"] > 0

@patch('app.services.relocation_service.suggest_relocation_ai')
def test_relocation_room_not_found(mock_ai, client):
    # This will fail if the DB has no empty rooms matching the criteria
    response = client.post("/api/relocation/", json={"room_id": "FAKE-999", "attendance_count": 9999})
    assert response.status_code == 404
