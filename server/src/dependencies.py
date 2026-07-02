from fastapi import Header, HTTPException
from pydantic import BaseModel

class User(BaseModel):
    id: str
    name: str
    role: str

# In a real app, this would be validating a JWT token.
# For our hackathon, we simply trust the headers sent by the frontend.
def get_current_user(
    x_user_id: str = Header(..., description="The mock user ID"),
    x_role: str = Header(..., description="The mock user role"),
) -> User:
    
    if not x_user_id or not x_role:
         raise HTTPException(status_code=401, detail="Missing authentication headers")
         
    # We don't have the user's name in the header, so we determine it based on role
    name = "Unknown"
    if x_role == "admin": name = "Priya Sharma"
    elif x_role == "owner": name = "Arjun Mehta"
    elif x_role == "auditor": name = "Meera Iyer"

    return User(id=x_user_id, name=name, role=x_role)

def require_admin(user: User):
    """Dependency to ensure the user is an admin."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
