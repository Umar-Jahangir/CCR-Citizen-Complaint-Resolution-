import uuid

def generate_ticket_id():
    return f"GRV-{uuid.uuid4().hex[:8].upper()}"
