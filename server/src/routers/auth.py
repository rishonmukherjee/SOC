from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    role: str

class LoginResponse(BaseModel):
    userId: str
    name: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    Authenticates a user based on role and issues a session payload.
    """
    if request.role == "admin":
        return LoginResponse(userId="user-admin", name="Priya Sharma", role="admin")
    elif request.role == "owner":
        return LoginResponse(userId="user-owner", name="Arjun Mehta", role="owner")
    elif request.role == "auditor":
        return LoginResponse(userId="user-auditor", name="Meera Iyer", role="auditor")
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be 'admin', 'owner', or 'auditor'.")
