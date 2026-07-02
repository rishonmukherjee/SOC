from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.routers import auth, risks, controls, evidence, dpdp, activity_log, dashboard

app = FastAPI(title="ComplianceOS API")

# Configure CORS so the React frontend can talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For the hackathon, accept all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include our API routers
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(risks.router, prefix="/api/v1/risks")
app.include_router(controls.router, prefix="/api/v1/controls")
app.include_router(evidence.router, prefix="/api/v1/evidence")
app.include_router(dpdp.router, prefix="/api/v1/dpdp")
app.include_router(activity_log.router, prefix="/api/v1/activity-log")
app.include_router(dashboard.router, prefix="/api/v1/dashboard")

import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the ComplianceOS Backend API!"}
