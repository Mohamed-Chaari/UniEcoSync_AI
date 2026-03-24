def test_weather_random(client):
    response = client.get("/api/weather/")
    assert response.status_code == 200
    data = response.json()
    assert "condition" in data
    assert "temperature_c" in data
    assert "humidity_percent" in data
    assert "sustainability_actions" in data
    assert isinstance(data["sustainability_actions"], list)
    assert len(data["sustainability_actions"]) > 0
    assert "severity" in data
    assert data["severity"] in ["low", "medium", "high"]

def test_weather_scenario_rain(client):
    response = client.get("/api/weather/?scenario=rain")
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "high"
    # Ensure "irrigation" is in at least one of the sustainability actions
    actions = data["sustainability_actions"]
    assert any("irrigation" in action.lower() for action in actions)

def test_weather_scenario_heatwave(client):
    response = client.get("/api/weather/?scenario=heatwave")
    assert response.status_code == 200
    data = response.json()
    assert data["temperature_c"] > 35
    assert data["severity"] == "high"

def test_weather_scenario_clear(client):
    response = client.get("/api/weather/?scenario=clear")
    assert response.status_code == 200
    data = response.json()
    assert data["severity"] == "low"

def test_weather_invalid_scenario(client):
    response = client.get("/api/weather/?scenario=tornado")
    assert response.status_code == 200
    data = response.json()
    # It should fall back to a random valid scenario, so it should still have valid fields
    assert "condition" in data
    assert "severity" in data
    assert data["severity"] in ["low", "medium", "high"]
