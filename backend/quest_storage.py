import json
import os
from datetime import datetime

STATE_FILE = "user_state.json"

def get_user_state():
    if not os.path.exists(STATE_FILE):
        return {"goal": "be more productive", "streak": 0, "missed": 0, "last_completed": None}
    with open(STATE_FILE, "r") as f:
        return json.load(f)

def save_user_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def update_streak(completed=True):
    state = get_user_state()
    today = datetime.now().date().isoformat()
    last_completed = state.get("last_completed")

    if completed:
        if last_completed != today:
            state["streak"] += 1
            state["last_completed"] = today
    else:
        state["streak"] = 0
        state["missed"] += 1
        state["last_completed"] = None

    save_user_state(state)
    return state
