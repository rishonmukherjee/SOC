from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import auth, risks, controls

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the ComplianceOS Backend API!"}
