from langchain_community.llms import Ollama
from quest_storage import get_user_state
from cache_utils import run_quest_agent_cached  # You'll create this


llm = Ollama(model="mistral")

# Warm up the model once at startup
llm.invoke("warmup")

def run_quest_agent():
    state = get_user_state()
    return run_quest_agent_cached(state, llm.invoke)



def run_streak_advisor():
    state = get_user_state()
    streak = state.get("streak", 0)

    prompt = f"""
User streak: {streak} days.
Reply with 1 sentence of motivation or a small reward idea.
Keep it short and kind.
"""

    return llm.invoke(prompt).strip()
