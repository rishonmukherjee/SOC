from fastapi import Header, HTTPException
from pydantic import BaseModel

# User names keyed by role — mirrors the mock personas defined in auth.py.
_ROLE_NAMES = {
    "admin":   "Priya Sharma",
    "owner":   "Arjun Mehta",
    "auditor": "Meera Iyer",
}

class User(BaseModel):
    id: str
    name: str
    role: str


def get_current_user(
    x_user_id: str = Header(..., description="Authenticated user ID"),
    x_role: str = Header(..., description="Authenticated user role"),
) -> User:
    """
    Resolves the current user from request headers.
    ComplianceOS uses header-based session tokens set after login.
    """
    if not x_user_id or not x_role:
        raise HTTPException(status_code=401, detail="Missing authentication headers")

    name = _ROLE_NAMES.get(x_role, "Unknown")
    return User(id=x_user_id, name=name, role=x_role)


def require_admin(user: User) -> User:
    """Raises 403 if the authenticated user does not hold the 'admin' role."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
