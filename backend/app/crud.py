from sqlalchemy.orm import Session
from sqlalchemy import extract, case
from sqlalchemy import func
from datetime import datetime, timedelta
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

def get_weekly_trend(db: Session):
    last_7_days = datetime.utcnow() - timedelta(days=6)

    rows = (
        db.query(
            extract("dow", models.Grievance.created_at).label("day"),
            func.count().label("total"),
            func.sum(
                case(
                    (func.lower(models.Grievance.status) == "resolved", 1),
                    else_=0
                )
            ).label("resolved")
        )
        .filter(models.Grievance.created_at >= last_7_days)
        .group_by("day")
        .order_by("day")
        .all()
    )

    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return [
        {
            "day": days[int(r.day)],
            "complaints": r.total,
            "resolved": r.resolved or 0,
        }
        for r in rows
    ]


def get_category_distribution(db: Session):
    rows = (
        db.query(
            models.Grievance.category,
            func.count().label("count")
        )
        .group_by(models.Grievance.category)
        .all()
    )

    return [{"category": r.category, "count": r.count} for r in rows]


def get_department_performance(db: Session):
    rows = (
        db.query(
            models.Grievance.department,
            func.sum(case((func.lower(models.Grievance.status) == "pending", 1), else_=0)).label("pending"),
            func.sum(case((func.lower(models.Grievance.status) == "in progress", 1), else_=0)).label("in_progress"),
            func.sum(case((func.lower(models.Grievance.status) == "resolved", 1), else_=0)).label("resolved"),
        )
        .group_by(models.Grievance.department)
        .all()
    )

    return [
        {
            "name": r.department,
            "pending": r.pending or 0,
            "inProgress": r.in_progress or 0,
            "resolved": r.resolved or 0,
        }
        for r in rows
    ]

