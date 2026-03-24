from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_issue_success():
    # create dummy image file
    files = {
        'image': ('test.png', b"dummy image data", 'image/png')
    }
    data = {
        'description': 'Plumbing issue in the bathroom',
        'student_id': '123'
    }
    response = client.post("/api/report/issues/analyze", files=files, data=data)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["status"] == "success"
    assert "ai_category" in json_response
    assert "eco_points_awarded" in json_response
