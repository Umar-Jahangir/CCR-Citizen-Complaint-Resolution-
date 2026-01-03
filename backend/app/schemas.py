from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class CitizenCreate(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[EmailStr] = None


class GrievanceCreate(BaseModel):
    title: str
    description_text: str
    category: str
    location: str
    urgency_score: int
    priority: str
    department: str


class GrievanceResponse(BaseModel):
    ticket_id: str
    status: str
    created_at: datetime

class AIClassification(BaseModel):
    confidence: float
    urgencyScore: float
    sentiment: str


class GrievanceTrackResponse(BaseModel):
    ticketId: str
    title: str
    description: str
    status: str
    category: str
    location: str
    department: str
    priority: str
    submittedAt: datetime
    updatedAt: Optional[datetime] = None
    aiClassification: Optional[AIClassification] = None
