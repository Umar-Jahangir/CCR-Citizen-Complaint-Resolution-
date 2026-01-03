import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Citizen, Grievance
from app.utils.id_generator import generate_ticket_id

# ---------------- CONFIG ---------------- #
TOTAL_RECORDS = 500        # change this (1000, 5000, etc)
MAX_DAYS_OLD = 120         # grievances up to 4 months old
# ---------------------------------------- #

CATEGORIES = ["Infrastructure", "Water", "Electricity", "Sanitation", "Roads"]
DEPARTMENTS = ["Municipal", "Water Board", "Electricity Board", "PWD"]
PRIORITIES = ["low", "medium", "high"]
STATUSES = ["Pending", "In Progress", "Resolved"]
LOCATIONS = ["Sector 12", "Sector 7", "Main Road", "Near Hospital", "Block A"]

db: Session = SessionLocal()

def random_past_date():
    days_ago = random.randint(0, MAX_DAYS_OLD)
    return datetime.utcnow() - timedelta(days=days_ago)

def seed():
    print("🌱 Seeding grievances...")

    citizens = []

    # Create base citizens
    for i in range(50):
        citizen = Citizen(
            id=generate_ticket_id(),
            full_name=f"Citizen {i}",
            phone_number=f"9{random.randint(100000000,999999999)}",
            email=f"citizen{i}@example.com",
            created_at=random_past_date()
        )
        citizens.append(citizen)

    db.bulk_save_objects(citizens)
    db.commit()

    grievances = []

    for i in range(TOTAL_RECORDS):
        created_at = random_past_date()
        status = random.choices(
            STATUSES,
            weights=[0.4, 0.3, 0.3]  # more unresolved
        )[0]

        grievance = Grievance(
            id=generate_ticket_id(),
            citizen_id=random.choice(citizens).id,
            title=f"Mock Issue #{i}",
            description_text="This is a seeded grievance for testing analytics.",
            category=random.choice(CATEGORIES),
            urgency_score=random.randint(1, 10),
            priority=random.choice(PRIORITIES),
            department=random.choice(DEPARTMENTS),
            location=random.choice(LOCATIONS),
            status=status,
            created_at=created_at
        )

        grievances.append(grievance)

    db.bulk_save_objects(grievances)
    db.commit()

    print(f"✅ Inserted {TOTAL_RECORDS} grievances successfully")

if __name__ == "__main__":
    seed()
