from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
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
    citizen_id = Column(String, ForeignKey("citizens.id"))
    title = Column(String)
    description_text = Column(Text)
    category = Column(String)
    urgency_score = Column(Integer)
    priority = Column(String)
    department = Column(String)
    location = Column(String)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
