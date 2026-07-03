import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.routers import auth, risks, controls, evidence, dpdp, activity_log, dashboard
from src.db.database import init_db

init_db()

app = FastAPI(title="ComplianceOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/v1/auth")
app.include_router(risks.router,        prefix="/api/v1/risks")
app.include_router(controls.router,     prefix="/api/v1/controls")
app.include_router(evidence.router,     prefix="/api/v1/evidence")
app.include_router(dpdp.router,         prefix="/api/v1/dpdp")
app.include_router(activity_log.router, prefix="/api/v1/activity-log")
app.include_router(dashboard.router,    prefix="/api/v1/dashboard")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "ComplianceOS API is running."}
