from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Float
from datetime import datetime
from .database import Base

class Citizen(Base):
    __tablename__ = "citizens"
    id = Column(String, primary_key=True)
    full_name = Column(String)
    phone_number = Column(String)
    email = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(String, primary_key=True)
    ticket_id = Column(String, unique=True, index=True)
    citizen_id = Column(String, ForeignKey("citizens.id"))
    title = Column(String)
    description_text = Column(Text)
    category = Column(String)
    urgency_score = Column(Integer)
    priority = Column(String)
    department = Column(String)
    location = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    # AI Analysis fields
    sentiment = Column(String, nullable=True)
    sentiment_confidence = Column(Float, nullable=True)
    images = Column(Text, nullable=True)  # JSON string of base64 images
    image_analyses = Column(Text, nullable=True)  # JSON string of image analysis results
