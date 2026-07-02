import sqlite3
import uuid
from datetime import datetime, timedelta, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.db.database import get_db
from src.dependencies import get_current_user, User
from src.utils.activity_logger import log_activity

router = APIRouter()

# --- Pydantic Models ---

class DPDPRequestCreate(BaseModel):
    request_type: str # 'Access', 'Erasure', 'Correction'
    data_principal_name: str
    received_on: date

class DPDPRequestUpdate(BaseModel):
    status: Optional[str] = None # 'Open', 'In Progress', 'Completed', 'Rejected'
    assigned_to: Optional[str] = None

class DPDPRequestResponse(BaseModel):
    id: str
    request_type: str
    data_principal_name: str
    status: str
    received_on: date
    sla_due: date
    assigned_to: Optional[str]

class ConsentLogCreate(BaseModel):
    data_principal_name: str
    purpose: str
    consent_status: str # 'Given', 'Withdrawn', 'Pending'

class ConsentLogResponse(BaseModel):
    id: str
    data_principal_name: str
    purpose: str
    consent_status: str
    timestamp: str

# --- Routes ---

@router.get("/requests", response_model=List[DPDPRequestResponse])
def list_dpdp_requests(
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Sort by SLA due date ascending (closest deadline first)
    cursor = db.execute("SELECT * FROM dpdp_requests ORDER BY sla_due ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/requests", response_model=DPDPRequestResponse)
def log_dpdp_request(
    req: DPDPRequestCreate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can log DPDP requests")

    valid_types = ['Access', 'Erasure', 'Correction']
    if req.request_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid request_type. Must be one of {valid_types}")

    request_id = f"D-{uuid.uuid4().hex[:6].upper()}"
    
    # Calculate SLA due date (30 days from received date)
    sla_due = req.received_on + timedelta(days=30)

    try:
        cursor = db.execute(
            """
            INSERT INTO dpdp_requests (id, request_type, data_principal_name, status, received_on, sla_due) 
            VALUES (?, ?, ?, 'Open', ?, ?)
            """,
            (request_id, req.request_type, req.data_principal_name, req.received_on, sla_due)
        )
        log_activity(db, "DPDP Request", request_id, f"Logged new {req.request_type} request for {req.data_principal_name}", user.id, user.name)
        db.commit()
        
        cursor = db.execute("SELECT * FROM dpdp_requests WHERE id = ?", (request_id,))
        new_req = cursor.fetchone()
        return dict(new_req)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/requests/{request_id}", response_model=DPDPRequestResponse)
def update_dpdp_request(
    request_id: str,
    updates: DPDPRequestUpdate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update DPDP requests")

    update_data = updates.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    if "assigned_to" in update_data and update_data["assigned_to"] is not None:
        assignee = db.execute("SELECT role FROM users WHERE id = ?", (update_data["assigned_to"],)).fetchone()
        if not assignee:
            raise HTTPException(status_code=400, detail="Invalid assigned user")
        
        req_type = db.execute("SELECT request_type FROM dpdp_requests WHERE id = ?", (request_id,)).fetchone()
        if req_type and req_type["request_type"] == "Erasure" and assignee["role"] == "auditor":
            raise HTTPException(status_code=400, detail="Auditors cannot be assigned to data deletion (Erasure) requests")

    set_clauses = []
    params = []
    for key, value in update_data.items():
        set_clauses.append(f"{key} = ?")
        params.append(value)
        
    params.append(request_id)
    
    query = f"UPDATE dpdp_requests SET {', '.join(set_clauses)} WHERE id = ?"
    
    try:
        cursor = db.execute(query, params)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Request not found")
            
        log_activity(db, "DPDP Request", request_id, "Updated DPDP request", user.id, user.name)
        db.commit()
        
        cursor = db.execute("SELECT * FROM dpdp_requests WHERE id = ?", (request_id,))
        updated_req = cursor.fetchone()
        return dict(updated_req)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/consent-log", response_model=List[ConsentLogResponse])
def list_consent_log(
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    cursor = db.execute("SELECT * FROM consent_log ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/consent-log", response_model=ConsentLogResponse)
def log_consent(
    req: ConsentLogCreate,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can log consent")

    valid_statuses = ['Given', 'Withdrawn', 'Pending']
    if req.consent_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid consent_status. Must be one of {valid_statuses}")

    log_id = f"CL-{uuid.uuid4().hex[:6].upper()}"

    try:
        cursor = db.execute(
            """
            INSERT INTO consent_log (id, data_principal_name, purpose, consent_status) 
            VALUES (?, ?, ?, ?)
            """,
            (log_id, req.data_principal_name, req.purpose, req.consent_status)
        )
        log_activity(db, "Consent Log", log_id, f"Logged consent status '{req.consent_status}' for {req.data_principal_name}", user.id, user.name)
        db.commit()
        
        cursor = db.execute("SELECT * FROM consent_log WHERE id = ?", (log_id,))
        new_log = cursor.fetchone()
        return dict(new_log)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
