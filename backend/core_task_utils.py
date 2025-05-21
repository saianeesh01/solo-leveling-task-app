import os, json
from datetime import datetime

COMPLETED_DIR = "user_tasks_completed"
os.makedirs(COMPLETED_DIR, exist_ok=True)

def get_today_key():
    return datetime.now().strftime("%Y-%m-%d")

def get_completed_file(user_id):
    return os.path.join(COMPLETED_DIR, f"{user_id}_completed.json")

def mark_task_complete(user_id, title):
    file_path = get_completed_file(user_id)
    if os.path.exists(file_path):
        with open(file_path) as f:
            data = json.load(f)
    else:
        data = {}

    today = get_today_key()
    if today not in data:
        data[today] = []

    if title not in data[today]:
        data[today].append(title)

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

    return f"Task '{title}' marked as complete for today."

def get_completed_tasks_for_today(user_id):
    file_path = get_completed_file(user_id)
    if os.path.exists(file_path):
        with open(file_path) as f:
            data = json.load(f)
        return data.get(get_today_key(), [])
    return []
