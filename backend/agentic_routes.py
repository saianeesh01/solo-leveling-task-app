from flask import Blueprint, request, jsonify
from quest_agent import run_quest_agent, run_streak_advisor
from quest_storage import update_streak, get_user_state, save_user_state
import json
import os

agentic = Blueprint("agentic", __name__)

### --- CORE TASK UTILS ---
CORE_TASKS_FILE = "core_tasks.json"

def load_core_tasks():
    if not os.path.exists(CORE_TASKS_FILE):
        return []
    with open(CORE_TASKS_FILE, "r") as f:
        return json.load(f)

def save_core_tasks(tasks):
    with open(CORE_TASKS_FILE, "w") as f:
        json.dump(tasks, f, indent=2)

### --- ROUTES ---

@agentic.route("/api/set-goal", methods=["POST"])
def set_goal():
    goal = request.json.get("goal")
    state = get_user_state()
    state["goal"] = goal
    save_user_state(state)
    return jsonify({"message": "Goal saved."})

@agentic.route("/api/ai-quest", methods=["GET"])
def ai_quest():
    quest = run_quest_agent()
    return jsonify({"quest": quest})

@agentic.route("/api/ai-complete", methods=["POST"])
def ai_complete():
    try:
        update_streak(completed=True)
        return jsonify({"message": "Quest completed. Streak updated."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@agentic.route("/api/ai-miss", methods=["POST"])
def ai_miss():
    update_streak(completed=False)
    return jsonify({"message": "Missed task. Streak reset."})

@agentic.route("/api/streak-advice", methods=["GET"])
def streak_advice():
    message = run_streak_advisor()
    return jsonify({"message": message})

@agentic.route("/api/streak", methods=["GET"])
def get_streak():
    state = get_user_state()
    return jsonify({"streak": state.get("streak", 0)})

@agentic.route("/api/user-state", methods=["GET"])
def get_state():
    return jsonify(get_user_state())

### --- CORE TASK ROUTES ---

@agentic.route("/api/core-tasks", methods=["GET"])
def get_tasks():
    tasks = load_core_tasks()
    return jsonify(tasks)

@agentic.route("/api/core-tasks", methods=["POST"])
def create_task():
    task = request.json
    tasks = load_core_tasks()
    tasks.append(task)
    save_core_tasks(tasks)
    return jsonify({"message": "Task added."})

@agentic.route("/api/core-tasks", methods=["DELETE"])
def remove_task():
    title = request.args.get("title")
    tasks = load_core_tasks()
    filtered = [t for t in tasks if t["title"] != title]
    save_core_tasks(filtered)
    return jsonify({"message": "Task removed."})
