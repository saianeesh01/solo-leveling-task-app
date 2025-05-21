from flask import Blueprint, request, jsonify
import os
import json
import re
from datetime import datetime
from core_task_utils import mark_task_complete, get_completed_tasks_for_today  


core = Blueprint("core", __name__)

# Directory to store per-user core task files
USER_TASKS_DIR = "user_tasks"
os.makedirs(USER_TASKS_DIR, exist_ok=True)

# --- Utility Functions ---


@core.route("/api/core-tasks/completed", methods=["POST"])
def mark_core_task_done():
    user_id = request.headers.get("X-User-ID", "default")
    title = request.json.get("title")
    return jsonify({"message": mark_task_complete(user_id, title)})

@core.route("/api/core-tasks/completed", methods=["GET"])
def get_today_completed_tasks():
    user_id = request.headers.get("X-User-ID", "default")
    completed = get_completed_tasks_for_today(user_id)
    return jsonify({"completed": completed})

def get_user_id():
    """Extract user ID from header or fallback to default."""
    return request.headers.get("X-User-ID", "default")

def safe_filename(user_id):
    """Sanitize user ID for safe file usage."""
    return re.sub(r'[^a-zA-Z0-9_-]', '_', user_id)

def get_user_task_file(user_id):
    """Path to user's task file."""
    return os.path.join(USER_TASKS_DIR, f"{safe_filename(user_id)}_core_tasks.json")

def load_tasks():
    user_id = get_user_id()
    filepath = get_user_task_file(user_id)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r") as f:
        return json.load(f)

def save_tasks(tasks):
    user_id = get_user_id()
    filepath = get_user_task_file(user_id)
    with open(filepath, "w") as f:
        json.dump(tasks, f, indent=2)

# --- API Routes ---

@core.route("/api/core-tasks", methods=["GET"])
def get_core_tasks():
    try:
        tasks = load_tasks()
        return jsonify(tasks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@core.route("/api/core-tasks", methods=["POST"])
def add_core_task():
    try:
        data = request.get_json()
        if not data.get("title"):
            return jsonify({"error": "Task title is required"}), 400

        tasks = load_tasks()
        if any(t["title"] == data["title"] for t in tasks):
            return jsonify({"error": "Task already exists"}), 409

        tasks.append(data)
        save_tasks(tasks)
        return jsonify({"message": "Task added."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@core.route("/api/core-tasks", methods=["DELETE"])
def delete_core_task():
    try:
        title = request.args.get("title")
        if not title:
            return jsonify({"error": "Missing task title"}), 400

        tasks = load_tasks()
        filtered = [t for t in tasks if t["title"] != title]

        if len(filtered) == len(tasks):
            return jsonify({"message": "No matching task found."}), 404

        save_tasks(filtered)
        return jsonify({"message": "Task deleted."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_completion_log_file(user_id):
    return os.path.join(USER_TASKS_DIR, f"{safe_filename(user_id)}_completed_core_tasks.json")

def get_today_key():
    return datetime.now().strftime("%Y-%m-%d")

def get_completed_tasks_for_today(user_id):
    log_file = get_completion_log_file(user_id)
    if not os.path.exists(log_file):
        return []
    with open(log_file, "r") as f:
        data = json.load(f)
    return data.get(get_today_key(), [])

def mark_task_complete(user_id, task_title):
    log_file = get_completion_log_file(user_id)
    today = get_today_key()
    data = {}

    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            data = json.load(f)

    today_tasks = data.get(today, [])
    if task_title in today_tasks:
        return "Task already completed today."

    today_tasks.append(task_title)
    data[today] = today_tasks

    with open(log_file, "w") as f:
        json.dump(data, f, indent=2)

    return "Task marked complete."
