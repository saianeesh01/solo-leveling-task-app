xp_total = 0

def update_xp(task, completed):
    global xp_total
    if completed:
        gained = 100  # dynamic later
        xp_total += gained
        return {"xp": gained, "total_xp": xp_total}
    else:
        return apply_penalty()

def apply_penalty():
    global xp_total
    lost = 50
    xp_total = max(0, xp_total - lost)
    return {"xp_penalty": lost, "total_xp": xp_total}
