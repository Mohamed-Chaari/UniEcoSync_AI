import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

from backend.app.services.gemini_service import analyze_report, suggest_relocation_ai

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"API Key present: {bool(api_key)}")

    print("\n--- Testing analyze_report ---")
    try:
        report_result = analyze_report("There is a large water pipe leaking on the 2nd floor near the bathrooms.")
        print("Success:", report_result)
    except Exception as e:
        print("Failed:", repr(e))

    print("\n--- Testing suggest_relocation_ai ---")
    try:
        available_rooms = [{"room_name": "Amphi", "capacity": 200}, {"room_name": "SC1", "capacity": 40}]
        relocation_result = suggest_relocation_ai(available_rooms, 30, "lab 1")
        print("Success:", relocation_result)
    except Exception as e:
        print("Failed:", repr(e))

if __name__ == "__main__":
    main()
