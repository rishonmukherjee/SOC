import sqlite3
import uuid
import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from src.db.database import get_db
from src.dependencies import get_current_user, User

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Pydantic Models ---
from pydantic import BaseModel

class EvidenceReviewRequest(BaseModel):
    status: str # 'Approved', 'Rejected', 'Needs Resubmission'

class EvidenceResponse(BaseModel):
    id: str
    control_id: str
    file_url_or_text: str
    status: str
    uploaded_by: Optional[str]
    reviewed_by: Optional[str]
    created_at: str

# --- Routes ---

@router.get("", response_model=List[EvidenceResponse])
def list_evidence(
    status: Optional[str] = None,
    control_id: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = "SELECT * FROM evidence WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = ?"
        params.append(status)
    if control_id:
        query += " AND control_id = ?"
        params.append(control_id)
        
    cursor = db.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

# We don't mount this directly under /evidence, we mount it under /controls/{control_id}/evidence
@router.post("/controls/{control_id}/evidence", response_model=EvidenceResponse)
def upload_evidence(
    control_id: str,
    file: Optional[UploadFile] = File(None),
    link_or_text: Optional[str] = Form(None),
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Verify control exists
    cursor = db.execute("SELECT id FROM controls WHERE id = ?", (control_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Control not found")

    if not file and not link_or_text:
        raise HTTPException(status_code=400, detail="Must provide either a file or a text link")

    evidence_id = f"E-{uuid.uuid4().hex[:6].upper()}"
    file_url_or_text = ""

    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_url_or_text = f"/uploads/{file.filename}"
    else:
        file_url_or_text = link_or_text

    try:
        cursor = db.execute(
            """
            INSERT INTO evidence (id, control_id, file_url_or_text, status, uploaded_by) 
            VALUES (?, ?, ?, 'Pending Review', ?)
            """,
            (evidence_id, control_id, file_url_or_text, user.id)
        )
        db.commit()
        
        cursor = db.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
        new_evidence = cursor.fetchone()
        return dict(new_evidence)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{evidence_id}/review", response_model=EvidenceResponse)
def review_evidence(
    evidence_id: str,
    req: EvidenceReviewRequest,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Role check: Only admin or auditor can review evidence
    if user.role not in ["admin", "auditor"]:
        raise HTTPException(status_code=403, detail="Only admins or auditors can review evidence")

    valid_statuses = ['Approved', 'Rejected', 'Needs Resubmission']
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    try:
        cursor = db.execute(
            "UPDATE evidence SET status = ?, reviewed_by = ? WHERE id = ?",
            (req.status, user.id, evidence_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Evidence not found")
        db.commit()
        
        cursor = db.execute("SELECT * FROM evidence WHERE id = ?", (evidence_id,))
        updated_evidence = cursor.fetchone()
        return dict(updated_evidence)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
