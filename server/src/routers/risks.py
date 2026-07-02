import sqlite3
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.db.database import get_db
from src.dependencies import get_current_user, User
from src.utils.activity_logger import log_activity

router = APIRouter()

# --- Pydantic Models ---

class RiskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    likelihood: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)

class RiskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    likelihood: Optional[int] = Field(None, ge=1, le=5)
    impact: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = None

class LinkControlRequest(BaseModel):
    control_id: str

class RiskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    likelihood: int
    impact: int
    score: int
    status: str
    created_at: str

class RiskDetailResponse(RiskResponse):
    linked_controls: List[dict]

# --- Routes ---

@router.get("", response_model=List[RiskResponse])
def list_risks(
    status: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = "SELECT * FROM risks"
    params = []
    
    if status:
        query += " WHERE status = ?"
        params.append(status)
        
    cursor = db.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("", response_model=RiskResponse)
def create_risk(
    risk: RiskCreate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Only admins can create risks for now, though not strictly required by the prompt, it's good practice. 
    # The hackathon spec didn't strictly say ONLY admin, but let's just let anyone for now or follow the UI gating.
    risk_id = f"R-{uuid.uuid4().hex[:6].upper()}"
    
    try:
        cursor = db.execute(
            """
            INSERT INTO risks (id, title, description, likelihood, impact) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (risk_id, risk.title, risk.description, risk.likelihood, risk.impact)
        )
        log_activity(db, "Risk", risk_id, f"Created Risk: {risk.title}", user.id, user.name)
        db.commit()
        
        # Fetch the created risk to return it (gets the auto-calculated score and defaults)
        cursor = db.execute("SELECT * FROM risks WHERE id = ?", (risk_id,))
        new_risk = cursor.fetchone()
        return dict(new_risk)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{risk_id}", response_model=RiskDetailResponse)
def get_risk(
    risk_id: str,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cursor = db.execute("SELECT * FROM risks WHERE id = ?", (risk_id,))
    risk_row = cursor.fetchone()
    
    if not risk_row:
        raise HTTPException(status_code=404, detail="Risk not found")
        
    cursor = db.execute(
        """
        SELECT c.* 
        FROM controls c
        JOIN risk_control_links rcl ON c.id = rcl.control_id
        WHERE rcl.risk_id = ?
        """,
        (risk_id,)
    )
    controls = cursor.fetchall()
    
    response = dict(risk_row)
    response["linked_controls"] = [dict(c) for c in controls]
    return response

@router.patch("/{risk_id}", response_model=RiskResponse)
def update_risk(
    risk_id: str,
    updates: RiskUpdate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    update_data = updates.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    set_clauses = []
    params = []
    for key, value in update_data.items():
        set_clauses.append(f"{key} = ?")
        params.append(value)
        
    params.append(risk_id)
    
    query = f"UPDATE risks SET {', '.join(set_clauses)} WHERE id = ?"
    
    try:
        cursor = db.execute(query, params)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Risk not found")
            
        log_activity(db, "Risk", risk_id, "Updated Risk", user.id, user.name)
        db.commit()
        
        cursor = db.execute("SELECT * FROM risks WHERE id = ?", (risk_id,))
        updated_risk = cursor.fetchone()
        return dict(updated_risk)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{risk_id}/link-control")
def link_control(
    risk_id: str,
    req: LinkControlRequest,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        db.execute(
            "INSERT INTO risk_control_links (risk_id, control_id) VALUES (?, ?)",
            (risk_id, req.control_id)
        )
        db.commit()
        return {"message": f"Control {req.control_id} linked to Risk {risk_id}"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Link already exists or invalid IDs")

@router.delete("/{risk_id}/link-control/{control_id}")
def unlink_control(
    risk_id: str,
    control_id: str,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cursor = db.execute(
        "DELETE FROM risk_control_links WHERE risk_id = ? AND control_id = ?",
        (risk_id, control_id)
    )
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link removed"}
