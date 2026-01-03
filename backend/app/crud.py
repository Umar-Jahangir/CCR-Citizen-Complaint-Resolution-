from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
from .utils.id_generator import generate_ticket_id
from .models import Grievance

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

def get_grievance_by_ticket_id(db: Session, ticket_id: str):
    return db.query(models.Grievance).filter(
        models.Grievance.id == ticket_id
    ).first()

def get_all_grievances(
    db: Session,
    status: str | None = None,
    priority: str | None = None
):
    query = db.query(Grievance)

    if status:
        query = query.filter(func.lower(Grievance.status) == status.lower())

    if priority:
        query = query.filter(func.lower(Grievance.priority) == priority.lower())

    return query.order_by(Grievance.created_at.desc()).all()


def get_grievance_by_ticket_id(db: Session, ticket_id: str):
    return db.query(Grievance).filter(Grievance.id == ticket_id).first()


def update_grievance_status(db: Session, ticket_id: str, new_status: str):
    grievance = get_grievance_by_ticket_id(db, ticket_id)
    if not grievance:
        return None

    grievance.status = new_status.capitalize()
    db.commit()
    db.refresh(grievance)
    return grievance