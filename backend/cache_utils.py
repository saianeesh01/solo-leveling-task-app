# backend/cache_utils.py
import hashlib
import json
from pathlib import Path

CACHE_FILE = Path("quest_cache.json")

if CACHE_FILE.exists():
    with open(CACHE_FILE, "r") as f:
        quest_cache = json.load(f)
else:
    quest_cache = {}

def save_cache():
    with open(CACHE_FILE, "w") as f:
        json.dump(quest_cache, f, indent=2)

def make_cache_key(data):
    key_string = json.dumps(data, sort_keys=True)
    return hashlib.sha256(key_string.encode()).hexdigest()

def run_quest_agent_cached(state, llm_invoke_func):
    prompt_data = {
        "goal": state.get("goal", "improve health"),
        "streak": state.get("streak", 0),
        "missed": state.get("missed", 0),
    }
    cache_key = make_cache_key(prompt_data)

    if cache_key in quest_cache:
        return quest_cache[cache_key]

    prompt = f"""
Suggest 1 realistic quest to help the user improve.

Goal: {prompt_data['goal']}
Streak: {prompt_data['streak']} days
Missed recently: {prompt_data['missed']} days

Reply in this format: [Quest title (XP)]
Keep it short (under 12 words).
Vary the type (fitness, learning, social, mindfulness, etc).
Avoid repeating water-related tasks unless needed.
"""
    result = llm_invoke_func(prompt).strip()
    quest_cache[cache_key] = result
    save_cache()
    return result
