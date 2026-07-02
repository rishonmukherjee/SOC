import sqlite3
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.db.database import get_db
from src.dependencies import get_current_user, User
from src.utils.activity_logger import log_activity

router = APIRouter()

# --- Pydantic Models ---

class ControlUpdate(BaseModel):
    status: Optional[str] = None
    owner_id: Optional[str] = None

class ControlResponse(BaseModel):
    id: str
    name: str
    trust_criteria: str
    description: Optional[str]
    status: str
    owner_id: str

class ControlDetailResponse(ControlResponse):
    linked_risks: List[dict]
    evidence: List[dict]

# --- Routes ---

@router.get("", response_model=List[ControlResponse])
def list_controls(
    status: Optional[str] = None,
    owner_id: Optional[str] = None,
    trust_criteria: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = "SELECT * FROM controls WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = ?"
        params.append(status)
    if owner_id:
        query += " AND owner_id = ?"
        params.append(owner_id)
    if trust_criteria:
        query += " AND trust_criteria = ?"
        params.append(trust_criteria)
        
    cursor = db.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.get("/{control_id}", response_model=ControlDetailResponse)
def get_control(
    control_id: str,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Fetch control
    cursor = db.execute("SELECT * FROM controls WHERE id = ?", (control_id,))
    control_row = cursor.fetchone()
    
    if not control_row:
        raise HTTPException(status_code=404, detail="Control not found")
        
    # Fetch linked risks
    cursor = db.execute(
        """
        SELECT r.* 
        FROM risks r
        JOIN risk_control_links rcl ON r.id = rcl.risk_id
        WHERE rcl.control_id = ?
        """,
        (control_id,)
    )
    risks = cursor.fetchall()
    
    # Fetch attached evidence
    cursor = db.execute("SELECT * FROM evidence WHERE control_id = ?", (control_id,))
    evidence = cursor.fetchall()
    
    response = dict(control_row)
    response["linked_risks"] = [dict(r) for r in risks]
    response["evidence"] = [dict(e) for e in evidence]
    return response

@router.patch("/{control_id}", response_model=ControlResponse)
def update_control(
    control_id: str,
    updates: ControlUpdate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    update_data = updates.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    # In a real app we'd check if the user is an admin or the control owner here

    set_clauses = []
    params = []
    for key, value in update_data.items():
        set_clauses.append(f"{key} = ?")
        params.append(value)
        
    params.append(control_id)
    
    query = f"UPDATE controls SET {', '.join(set_clauses)} WHERE id = ?"
    
    try:
        cursor = db.execute(query, params)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Control not found")
            
        log_activity(db, "Control", control_id, "Updated Control", user.id, user.name)
        db.commit()
        
        cursor = db.execute("SELECT * FROM controls WHERE id = ?", (control_id,))
        updated_control = cursor.fetchone()
        return dict(updated_control)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
