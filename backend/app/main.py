from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routes.grievance import router as grievance_router
from .routes.admin import router as admin_router

app = FastAPI(title="Grievance Redressal System")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(grievance_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"status": "DB ready"}
