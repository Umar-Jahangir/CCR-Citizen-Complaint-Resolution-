from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from ..database import SessionLocal
from .. import schemas, crud

router = APIRouter(prefix="/grievances", tags=["Grievances"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/submit", response_model=schemas.GrievanceResponse)
def submit_grievance(
    # Citizen (MATCH schema exactly)
    full_name: str = Form(...),
    phone_number: str = Form(...),
    email: str = Form(None),

    # Grievance (MATCH schema exactly)
    title: str = Form(...),
    description_text: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    urgency_score: int = Form(...),
    priority: str = Form(...),
    department: str = Form(...),

    images: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    citizen_data = schemas.CitizenCreate(
        full_name=full_name,
        phone_number=phone_number,
        email=email
    )

    grievance_data = schemas.GrievanceCreate(
        title=title,
        description_text=description_text,
        category=category,
        location=location,
        urgency_score=urgency_score,
        priority=priority,
        department=department
    )

    db_citizen = crud.create_citizen(db, citizen_data)
    db_grievance = crud.create_grievance(db, db_citizen.id, grievance_data)

    return {
        "ticket_id": str(db_grievance.id),
        "status": db_grievance.status,
        "created_at": db_grievance.created_at
    }