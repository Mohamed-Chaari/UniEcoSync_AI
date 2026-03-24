from typing import TypedDict, Optional

class Room(TypedDict):
    room_id: str
    name: str
    capacity: int
    type: str
    hvac_zone: str
    currently_occupied: bool
    current_session: Optional[str]

CAMPUS_ROOMS: dict[str, Room] = {
    "AMP-A1": {
        "room_id": "AMP-A1",
        "name": "Amphitheater A1",
        "capacity": 400,
        "type": "amphitheater",
        "hvac_zone": "Zone-A-Main",
        "currently_occupied": True,
        "current_session": "CS101 Intro to Computer Science"
    },
    "AMP-B2": {
        "room_id": "AMP-B2",
        "name": "Amphitheater B2",
        "capacity": 250,
        "type": "amphitheater",
        "hvac_zone": "Zone-B-Main",
        "currently_occupied": False,
        "current_session": None
    },
    "CR-101": {
        "room_id": "CR-101",
        "name": "Classroom 101",
        "capacity": 60,
        "type": "classroom",
        "hvac_zone": "Zone-C-East",
        "currently_occupied": False,
        "current_session": None
    },
    "CR-102": {
        "room_id": "CR-102",
        "name": "Classroom 102",
        "capacity": 50,
        "type": "classroom",
        "hvac_zone": "Zone-C-East",
        "currently_occupied": True,
        "current_session": "MATH201 Calculus II"
    },
    "CR-205": {
        "room_id": "CR-205",
        "name": "Classroom 205",
        "capacity": 40,
        "type": "classroom",
        "hvac_zone": "Zone-C-West",
        "currently_occupied": False,
        "current_session": None
    },
    "LAB-301": {
        "room_id": "LAB-301",
        "name": "Physics Lab 301",
        "capacity": 30,
        "type": "lab",
        "hvac_zone": "Zone-D-North",
        "currently_occupied": False,
        "current_session": None
    },
    "LAB-302": {
        "room_id": "LAB-302",
        "name": "Chemistry Lab 302",
        "capacity": 25,
        "type": "lab",
        "hvac_zone": "Zone-D-South",
        "currently_occupied": True,
        "current_session": "CHEM101 Intro to Chemistry"
    },
    "CR-404": {
        "room_id": "CR-404",
        "name": "Seminar Room 404",
        "capacity": 20,
        "type": "classroom",
        "hvac_zone": "Zone-E-Top",
        "currently_occupied": False,
        "current_session": None
    }
}
