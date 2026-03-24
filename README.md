# UniEcoSync AI: Smart Campus Management

UniEcoSync AI is a crowdsourced, AI-powered smart campus management platform designed to optimize resources, reduce energy waste, and empower the university community.

## Architecture

```
Mobile App (Expo React Native)
       |
       |--- HTTP /api ---> FastAPI Backend
       |                   |--> Smart Relocation Service (Dummy Schedule Data)
       |                   |--> Mock Weather Service (?scenario=rain|heatwave|clear)
       |
       |--- SDK ---------> Firebase
                           |--> Auth (Role-based access)
                           |--> Firestore (Anomaly Reports & User Roles)
```

## Features & Role Access

- **Students**: Dashboard, Report Issue, Eco-Rewards
- **Professors**: Dashboard, Report Issue, Smart Relocation, Eco-Rewards
- **Maintenance**: Dashboard, Maintenance Inbox (real-time anomaly tracking)

## Setup Instructions

### 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (Email/Password provider).
3. Enable **Firestore Database**.
4. Copy the config values and paste them into `frontend/.env.local` (rename from `frontend/.env.example`).
5. Set up Firestore Rules (WARNING: These are open for hackathon prototyping ONLY):
   Deploy the `firestore.rules` file provided in the repo root or manually set them in the console.

### 2. Gemini Setup
1. Get a free API key from https://aistudio.google.com/app/apikey
2. Add to `backend/.env` as `GEMINI_API_KEY=your_actual_key`
3. Restart the backend server

### 3. Demo Accounts Setup
Create these three users manually in Firebase Authentication to test all roles:
- **Professor**: `prof@unicampus.edu` / `demo1234`
- **Student**: `student@unicampus.edu` / `demo1234`
- **Maintenance**: `maintenance@unicampus.edu` / `demo1234`
*(Note: Log in with each account via the app to initialize their role in Firestore).*

### 4. Running the App locally

Use the provided `Makefile` to launch the services.

Start everything concurrently:
```bash
make dev
```

Or run them individually:
```bash
make backend
make frontend
```

To clean up Docker containers:
```bash
make clean
```

## API Endpoints

### `POST /api/relocation/`
Matches class size to an optimal vacant room to save energy.
**Request:**
```json
{
  "room_id": "AMP-A1",
  "attendance_count": 50
}
```
**Response:**
```json
{
  "suggested_room_id": "CR-101",
  "suggested_room_name": "Classroom 101",
  "capacity": 60,
  "energy_saving_estimate_kwh": 17.0,
  "action_items": [
    "Shutdown HVAC in Amphitheater A1 (Zone-A-Main)",
    "Redirect students to Classroom 101",
    "Update digital signage to reflect room change"
  ],
  "message": "Optimal relocation found based on real-time attendance."
}
```

### `GET /api/weather/?scenario=<scenario>`
Returns a simulated weather alert. Scenarios: `rain`, `heatwave`, `clear`.
**Response:**
```json
{
  "condition": "Heavy Rain Forecast",
  "temperature_c": 16.0,
  "humidity_percent": 89,
  "sustainability_actions": [
    "Suspend all campus irrigation systems immediately",
    "Activate covered walkway lighting"
  ],
  "severity": "high"
}
```

---
*Built for TechResolve Challenge 3.0*
