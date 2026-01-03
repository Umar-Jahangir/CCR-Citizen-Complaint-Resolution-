from sqlalchemy.orm import Session
from . import models
from .utils.id_generator import generate_ticket_id

def create_citizen(db: Session, citizen):
    db_citizen = models.Citizen(
        id=generate_ticket_id(),
        full_name=citizen.full_name,
        phone_number=citizen.phone_number,
        email=citizen.email
    )
    db.add(db_citizen)
    db.commit()
    db.refresh(db_citizen)
    return db_citizen


def create_grievance(db: Session, citizen_id: str, grievance):
    ticket_id = generate_ticket_id()
    db_grievance = models.Grievance(
        id=ticket_id,
        citizen_id=citizen_id,
        title=grievance.title,
        description_text=grievance.description_text,
        category=grievance.category,
        urgency_score=grievance.urgency_score,
        priority=grievance.priority,
        department=grievance.department,
        location=grievance.location,
        status="Pending"
    )
    db.add(db_grievance)
    db.commit()
    db.refresh(db_grievance)
    return db_grievance
