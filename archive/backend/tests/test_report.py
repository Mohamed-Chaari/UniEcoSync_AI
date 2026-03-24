import pytest
from app.models.database import Anomaly, User
from unittest.mock import patch

def test_submit_report_without_gemini_key(client):
    response = client.post("/api/report/", json={
        "type": "water_leak",
        "description": "Pipe is leaking on the 3rd floor.",
        "location": "Building C, 3rd Floor"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "water_leak"
    assert data["description"] == "Pipe is leaking on the 3rd floor."
    assert data["location"] == "Building C, 3rd Floor"
    assert "priority" in data
    assert "ai_analysis" in data
    assert data["id"] is not None

def test_get_admin_reports_empty(client):
    # Depending on order of tests, DB might have records.
    # We just ensure it returns the structure.
    response = client.get("/api/report/")

    assert response.status_code == 200
    data = response.json()
    assert "reports" in data
    assert "total_count" in data
    assert isinstance(data["reports"], list)
    assert isinstance(data["total_count"], int)

def test_submit_and_retrieve(client):
    # Submit a report
    post_response = client.post("/api/report/", json={
        "type": "electrical",
        "description": "Flickering lights in the hallway.",
        "location": "Building A, Hallway 1"
    })
    assert post_response.status_code == 200
    submitted_id = post_response.json()["id"]

    # Retrieve all reports
    get_response = client.get("/api/report/")
    assert get_response.status_code == 200
    data = get_response.json()

    # Verify the submitted report appears in the list
    reports = data["reports"]
    found = False
    for r in reports:
        if r["id"] == submitted_id:
            found = True
            assert r["type"] == "electrical"
            assert r["location"] == "Building A, Hallway 1"
            break

    assert found is True

@patch('app.routers.report.analyze_report')
def test_spam_filter_rejects_gibberish(mock_analyze_report, client):
    mock_analyze_report.return_value = {
        'is_spam': True,
        'priority': 'Low',
        'category': 'Other',
        'suggested_action': 'Manual review required.'
    }

    response = client.post("/api/report/", json={
        "type": "other",
        "description": "asdfghjkl random gibberish",
        "location": "Nowhere"
    })

    assert response.status_code == 400
    assert response.json()["detail"] == 'Spam detected. Report rejected.'

@patch('app.routers.report.analyze_report')
def test_valid_report_accepted(mock_analyze_report, client):
    mock_analyze_report.return_value = {
        'is_spam': False,
        'priority': 'High',
        'category': 'Plumbing',
        'suggested_action': 'Fix the water pipe immediately.'
    }

    response = client.post("/api/report/", json={
        "type": "water_leak",
        "description": "Massive water pipe burst in the library.",
        "location": "Library"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "High"
    assert data["ai_analysis"] == "[Category: Plumbing] Fix the water pipe immediately."

def test_leaderboard_returns_seeded_users(client):
    response = client.get("/api/leaderboard/")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 3

    if len(data) > 1:
        assert data[0]["eco_points"] >= data[-1]["eco_points"]
