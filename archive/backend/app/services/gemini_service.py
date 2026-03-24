import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def analyze_report(description: str) -> Dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not found in environment, using fallback.")
        return {
            "is_spam": False,
            "priority": "Medium",
            "category": "Other",
            "suggested_action": "[Local Model Fallback]: Maintenance review scheduled."
        }

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        prompt = (
            f"You are a strict Facilities Management AI for a University Campus. Your job is to evaluate student reports.\n"
            f"Rule 1 (Spam): If the report is gibberish (e.g., 'asdf', 'test'), a joke, greetings, or completely unrelated to campus infrastructure, you MUST flag it as spam (is_spam: true).\n"
            f"Rule 2 (Priority): You must accurately classify valid reports.\n"
            f"- 'High': Safety hazards, active water leaks, campus-wide power outages.\n"
            f"- 'Medium': Broken ACs, single broken projectors, broken doors.\n"
            f"- 'Low': Minor cosmetic issues, a full trash can, dirty floors.\n\n"
            f"Evaluate the following report description: '{description}'.\n\n"
            f"Respond in exactly this JSON format with no extra text:\n"
            f"{{\n"
            f"  \"is_spam\": boolean,\n"
            f"  \"priority\": \"Low\" | \"Medium\" | \"High\",\n"
            f"  \"category\": \"Plumbing\" | \"Electrical\" | \"HVAC\" | \"Other\",\n"
            f"  \"suggested_action\": \"Short action plan\"\n"
            f"}}\n"
        )

        response = model.generate_content(
            prompt,
            request_options={"timeout": 5.0}
        )

        # Try to parse the response text as JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)

        return {
            'is_spam': bool(result.get('is_spam', False)),
            'priority': result.get('priority', 'Medium'),
            'category': result.get('category', 'Other'),
            'suggested_action': result.get('suggested_action', 'Manual review required.')
        }

    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return {
            "is_spam": False,
            "priority": "Medium",
            "category": "Other",
            "suggested_action": "[Local Model Fallback]: Maintenance review scheduled."
        }

def _suggest_relocation_fallback(available_rooms: List[Dict[str, Any]], attendance: int, current_room_id: str) -> Dict[str, Any]:
    valid_rooms = [
        room for room in available_rooms
        if "lab" not in room.get("room_name", "").lower() and room.get("capacity", 0) >= attendance
    ]
    if not valid_rooms:
        return {
            "suggested_room_name": None,
            "capacity": 0,
            "energy_saving_estimate_kwh": 0.0,
            "action_items": [],
            "message": "Optimization Engine (Local): No suitable rooms available for relocation."
        }

    # Smallest gap: min(capacity - attendance)
    best_room = min(valid_rooms, key=lambda r: r.get("capacity", 0) - attendance)
    est_savings = round((200 - best_room.get("capacity", 0)) * 0.05, 2)

    return {
        "suggested_room_name": best_room.get("room_name"),
        "capacity": best_room.get("capacity"),
        "energy_saving_estimate_kwh": est_savings,
        "action_items": [
            f"Shutdown HVAC in {current_room_id}",
            "Redirect students to the new room",
            "Update digital signage to reflect room change"
        ],
        "message": f"Optimization Engine (Local): Selected {best_room.get('room_name')} to minimize energy overhead. Est. savings: {est_savings} kWh."
    }

def suggest_relocation_ai(available_rooms: List[Dict[str, Any]], attendance: int, current_room_id: str) -> Dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment for relocation, using fallback.")
        return _suggest_relocation_fallback(available_rooms, attendance, current_room_id)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        rooms_str = json.dumps(available_rooms)

        prompt = (
            f"You are a Smart Campus AI optimizing energy (SDG 13).\n"
            f"Given the attendance ({attendance}) and the list of real empty rooms: {rooms_str}\n"
            f"Choose the absolute most energy-efficient room (closest capacity to attendance without being smaller).\n"
            f"Do NOT suggest rooms outside this list.\n"
            f"Crucial Rule: Do not suggest any room with 'lab' (case-insensitive) in its name.\n\n"
            f"Calculate the energy saving estimate as: (current room capacity if you can guess it, otherwise 200 - suggested room capacity) * 0.05 kWh.\n\n"
            f"Respond in exactly this JSON format with no extra text:\n"
            f"{{\n"
            f"  \"suggested_room_name\": \"The name of the room you selected\",\n"
            f"  \"capacity\": The integer capacity of the room you selected,\n"
            f"  \"energy_saving_estimate_kwh\": The calculated float energy savings,\n"
            f"  \"action_items\": [\n"
            f"    \"Shutdown HVAC in {current_room_id}\",\n"
            f"    \"Redirect students to the new room\",\n"
            f"    \"Update digital signage to reflect room change\"\n"
            f"  ],\n"
            f"  \"message\": \"A detailed explanation of WHY this room was chosen to save energy (e.g., 'Selected SM 2 (capacity 20) for 15 students to avoid cooling a 70-person room').\"\n"
            f"}}\n"
        )

        response = model.generate_content(
            prompt,
            request_options={"timeout": 5.0}
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        result = json.loads(text)

        return {
            "suggested_room_name": result.get('suggested_room_name'),
            "capacity": result.get('capacity'),
            "energy_saving_estimate_kwh": round(float(result.get('energy_saving_estimate_kwh', 0.0)), 2),
            "action_items": result.get('action_items', []),
            "message": result.get('message', 'Relocation suggested by AI.')
        }

    except Exception as e:
        logger.error(f"Error calling Gemini API for relocation: {str(e)}")
        return _suggest_relocation_fallback(available_rooms, attendance, current_room_id)
