from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import json

from .database import engine, get_db
from .models import Base, Grievance, Citizen
from .services.ai_services import analyze_sentiment, analyze_image, analyze_grievance

app = FastAPI(title="Grievance AI Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ============ Pydantic Models ============

class TextAnalysisRequest(BaseModel):
    text: str


class ImageAnalysisRequest(BaseModel):
    image: str  # base64 encoded image


class GrievanceAnalysisRequest(BaseModel):
    text: str
    images: Optional[List[str]] = None  # list of base64 encoded images


class GrievanceCreateRequest(BaseModel):
    # Citizen info
    name: str
    phone: str
    email: Optional[str] = None
    # Grievance info
    title: str
    description: str
    category: Optional[str] = None
    location: str
    images: Optional[List[str]] = None  # base64 encoded images


class GrievanceUpdateRequest(BaseModel):
    status: Optional[str] = None
    department: Optional[str] = None
    priority: Optional[str] = None


class GrievanceResponse(BaseModel):
    id: str
    ticket_id: str
    title: str
    description: str
    category: Optional[str]
    location: str
    status: str
    priority: str
    department: str
    citizen_name: str
    citizen_phone: str
    citizen_email: Optional[str]
    images: Optional[List[str]]
    sentiment: Optional[str]
    sentiment_confidence: Optional[float]
    urgency_score: Optional[int]
    image_analyses: Optional[List[dict]]
    created_at: datetime

    class Config:
        from_attributes = True


@app.get("/")
def root():
    return {"status": "DB ready"}


@app.post("/api/analyze-text")
def analyze_text_endpoint(request: TextAnalysisRequest):
    """
    Analyze text sentiment using HuggingFace multilingual-e5-small model.
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters")

    result = analyze_sentiment(request.text)
    return result


@app.post("/api/analyze-image")
def analyze_image_endpoint(request: ImageAnalysisRequest):
    """
    Analyze image using Groq VLM to extract description and identify problems.
    """
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data is required")

    result = analyze_image(request.image)
    return result


@app.post("/api/analyze-grievance")
def analyze_grievance_endpoint(request: GrievanceAnalysisRequest):
    """
    Analyze a complete grievance including text and images.
    Returns combined analysis with sentiment, urgency, and image descriptions.
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters")

    result = analyze_grievance(request.text, request.images)
    return result


# ============ Grievance CRUD Endpoints ============

CATEGORY_DEPARTMENTS = {
    "sanitation": "Municipal Corporation",
    "water-supply": "Water Department",
    "electricity": "Electricity Board",
    "roads": "Public Works Department",
    "public-safety": "Police Department",
    "healthcare": "Health Department",
    "education": "Education Department",
    "housing": "Housing Authority",
    "other": "General Administration",
}


def generate_ticket_id():
    """Generate a unique ticket ID like GRV-2024-001"""
    import random
    year = datetime.now().year
    num = random.randint(100, 999)
    return f"GRV-{year}-{num}"


def determine_priority(urgency_score: int) -> str:
    """Determine priority based on urgency score"""
    if urgency_score >= 8:
        return "high"
    elif urgency_score >= 5:
        return "medium"
    return "low"


@app.post("/api/grievances")
def create_grievance(request: GrievanceCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new grievance with AI analysis.
    """
    # Run AI analysis
    ai_result = analyze_grievance(request.description, request.images)

    # Extract AI results
    sentiment = ai_result.get("text_analysis", {}).get("sentiment", "neutral")
    sentiment_confidence = ai_result.get("text_analysis", {}).get("confidence", 0.0)
    urgency_score = ai_result.get("overall_urgency", 5)
    image_analyses = ai_result.get("image_analyses", [])

    # Determine department and priority
    category = request.category or "other"
    department = CATEGORY_DEPARTMENTS.get(category, "General Administration")
    priority = determine_priority(urgency_score)

    # Create citizen record
    citizen_id = str(uuid.uuid4())
    citizen = Citizen(
        id=citizen_id,
        full_name=request.name,
        phone_number=request.phone,
        email=request.email
    )
    db.add(citizen)

    # Create grievance record
    grievance_id = str(uuid.uuid4())
    ticket_id = generate_ticket_id()

    grievance = Grievance(
        id=grievance_id,
        ticket_id=ticket_id,
        citizen_id=citizen_id,
        title=request.title,
        description_text=request.description,
        category=category,
        location=request.location,
        department=department,
        priority=priority,
        urgency_score=urgency_score,
        status="pending",
        sentiment=sentiment,
        sentiment_confidence=sentiment_confidence,
        images=json.dumps(request.images) if request.images else None,
        image_analyses=json.dumps(image_analyses) if image_analyses else None
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return {
        "success": True,
        "ticket_id": ticket_id,
        "grievance_id": grievance_id,
        "message": "Grievance submitted successfully",
        "ai_analysis": {
            "sentiment": sentiment,
            "urgency_score": urgency_score,
            "priority": priority,
            "department": department
        }
    }


@app.get("/api/grievances")
def list_grievances(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all grievances with optional filters.
    """
    query = db.query(Grievance, Citizen).join(Citizen, Grievance.citizen_id == Citizen.id)

    if status:
        query = query.filter(Grievance.status == status)
    if priority:
        query = query.filter(Grievance.priority == priority)
    if department:
        query = query.filter(Grievance.department == department)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Grievance.title.ilike(search_term)) |
            (Grievance.description_text.ilike(search_term)) |
            (Grievance.ticket_id.ilike(search_term))
        )

    results = query.order_by(Grievance.created_at.desc()).all()

    grievances = []
    for grievance, citizen in results:
        grievances.append({
            "id": grievance.id,
            "ticket_id": grievance.ticket_id,
            "title": grievance.title,
            "description": grievance.description_text,
            "category": grievance.category,
            "location": grievance.location,
            "status": grievance.status,
            "priority": grievance.priority,
            "department": grievance.department,
            "citizen_name": citizen.full_name,
            "citizen_phone": citizen.phone_number,
            "citizen_email": citizen.email,
            "images": json.loads(grievance.images) if grievance.images else [],
            "sentiment": grievance.sentiment,
            "sentiment_confidence": grievance.sentiment_confidence,
            "urgency_score": grievance.urgency_score,
            "image_analyses": json.loads(grievance.image_analyses) if grievance.image_analyses else [],
            "created_at": grievance.created_at.isoformat()
        })

    return {"grievances": grievances, "total": len(grievances)}


@app.get("/api/grievances/{grievance_id}")
def get_grievance(grievance_id: str, db: Session = Depends(get_db)):
    """
    Get a single grievance by ID.
    """
    result = db.query(Grievance, Citizen).join(
        Citizen, Grievance.citizen_id == Citizen.id
    ).filter(
        (Grievance.id == grievance_id) | (Grievance.ticket_id == grievance_id)
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grievance, citizen = result

    return {
        "id": grievance.id,
        "ticket_id": grievance.ticket_id,
        "title": grievance.title,
        "description": grievance.description_text,
        "category": grievance.category,
        "location": grievance.location,
        "status": grievance.status,
        "priority": grievance.priority,
        "department": grievance.department,
        "citizen_name": citizen.full_name,
        "citizen_phone": citizen.phone_number,
        "citizen_email": citizen.email,
        "images": json.loads(grievance.images) if grievance.images else [],
        "sentiment": grievance.sentiment,
        "sentiment_confidence": grievance.sentiment_confidence,
        "urgency_score": grievance.urgency_score,
        "image_analyses": json.loads(grievance.image_analyses) if grievance.image_analyses else [],
        "created_at": grievance.created_at.isoformat()
    }


@app.patch("/api/grievances/{grievance_id}")
def update_grievance(grievance_id: str, request: GrievanceUpdateRequest, db: Session = Depends(get_db)):
    """
    Update grievance status, department, or priority.
    """
    grievance = db.query(Grievance).filter(
        (Grievance.id == grievance_id) | (Grievance.ticket_id == grievance_id)
    ).first()

    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if request.status:
        grievance.status = request.status
    if request.department:
        grievance.department = request.department
    if request.priority:
        grievance.priority = request.priority

    db.commit()
    db.refresh(grievance)

    return {"success": True, "message": "Grievance updated successfully"}


@app.delete("/api/grievances/{grievance_id}")
def delete_grievance(grievance_id: str, db: Session = Depends(get_db)):
    """
    Delete a grievance by ID or ticket_id.
    """
    grievance = db.query(Grievance).filter(
        (Grievance.id == grievance_id) | (Grievance.ticket_id == grievance_id)
    ).first()

    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    db.delete(grievance)
    db.commit()

    return {"success": True, "message": "Grievance deleted successfully"}
