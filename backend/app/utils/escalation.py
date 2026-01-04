from datetime import datetime

ESCALATION_DAYS = 3  # configurable

def is_escalation_needed(status: str, created_at: datetime) -> bool:
    if status.lower() == "resolved":
        return False

    days_open = (datetime.utcnow() - created_at).days
    return days_open > ESCALATION_DAYS
