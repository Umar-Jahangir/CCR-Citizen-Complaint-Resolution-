from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import SessionLocal
from .. import schemas, crud
from sqlalchemy import func

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# DASHBOARD STATS
@router.get("/stats", response_model=schemas.AdminStatsResponse)
def admin_stats(db: Session = Depends(get_db)):
    total = db.query(func.count()).select_from(crud.models.Grievance).scalar()
    pending = db.query(func.count()).filter(func.lower(crud.models.Grievance.status) == "pending").scalar()
    in_progress = db.query(func.count()).filter(func.lower(crud.models.Grievance.status) == "in progress").scalar()
    resolved = db.query(func.count()).filter(func.lower(crud.models.Grievance.status) == "resolved").scalar()
    high_priority = db.query(func.count()).filter(func.lower(crud.models.Grievance.priority) == "high").scalar()

    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "high_priority": high_priority
    }


# LIST GRIEVANCES
@router.get("/grievances", response_model=List[schemas.AdminGrievanceListItem])
def list_grievances(
    status: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db)
):
    grievances = crud.get_all_grievances(db, status, priority)

    return [
        {
            "ticketId": g.id,
            "title": g.title,
            "category": g.category,
            "location": g.location,
            "department": g.department,
            "priority": g.priority.lower(),
            "status": g.status.lower().replace(" ", "-"),
            "submittedAt": g.created_at,
        }
        for g in grievances
    ]


# SINGLE GRIEVANCE
@router.get("/grievances/{ticket_id}", response_model=schemas.GrievanceTrackResponse)
def admin_grievance_detail(ticket_id: str, db: Session = Depends(get_db)):
    grievance = crud.get_grievance_by_ticket_id(db, ticket_id)

    if not grievance:
        raise HTTPException(status_code=404, detail="Not found")

    return {
        "ticketId": grievance.id,
        "title": grievance.title,
        "description": grievance.description_text,
        "status": grievance.status.lower(),
        "category": grievance.category,
        "location": grievance.location,
        "department": grievance.department,
        "priority": grievance.priority.lower(),
        "submittedAt": grievance.created_at,
        "updatedAt": grievance.created_at,
        "aiClassification": {
            "confidence": 0.82,
            "urgencyScore": grievance.urgency_score,
            "sentiment": "neutral"
        }
    }


# UPDATE STATUS
@router.patch("/grievances/{ticket_id}/status")
def update_status(
    ticket_id: str,
    body: schemas.UpdateStatusRequest,
    db: Session = Depends(get_db)
):
    grievance = crud.update_grievance_status(db, ticket_id, body.status)
    if not grievance:
        raise HTTPException(status_code=404, detail="Not found")

    return {"message": "Status updated"}
