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

class ControlDependencyInfo(BaseModel):
    related_control_id: str
    related_control_name: str
    relationship: str

class ControlResponse(BaseModel):
    id: str
    name: str
    trust_criteria: str
    description: Optional[str]
    status: str
    owner_id: str
    dependencies: Optional[List[ControlDependencyInfo]] = []

class ControlDetailResponse(ControlResponse):
    linked_risks: List[dict]
    evidence: List[dict]

class LinkControlDependencyRequest(BaseModel):
    related_control_id: str
    relationship: str # 'supplements', 'depends_on', 'replaces'

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
    
    # Fetch all dependencies and group by source_control_id
    dep_cursor = db.execute(
        """
        SELECT cd.source_control_id, cd.related_control_id, c.name as related_control_name, cd.relationship
        FROM control_dependencies cd
        JOIN controls c ON cd.related_control_id = c.id
        """
    )
    all_deps = dep_cursor.fetchall()
    deps_by_source = {}
    for dep in all_deps:
        src = dep["source_control_id"]
        if src not in deps_by_source:
            deps_by_source[src] = []
        deps_by_source[src].append({
            "related_control_id": dep["related_control_id"],
            "related_control_name": dep["related_control_name"],
            "relationship": dep["relationship"]
        })
        
    results = []
    for row in rows:
        d = dict(row)
        d["dependencies"] = deps_by_source.get(row["id"], [])
        results.append(d)
    return results

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
    
    # Fetch dependencies
    dep_cursor = db.execute(
        """
        SELECT cd.related_control_id, c.name as related_control_name, cd.relationship
        FROM control_dependencies cd
        JOIN controls c ON cd.related_control_id = c.id
        WHERE cd.source_control_id = ?
        """,
        (control_id,)
    )
    dependencies = dep_cursor.fetchall()
    
    response = dict(control_row)
    response["linked_risks"] = [dict(r) for r in risks]
    response["evidence"] = [dict(e) for e in evidence]
    response["dependencies"] = [dict(d) for d in dependencies]
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
        
        # Get updated control with its dependencies
        return get_control(control_id, db, user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{control_id}/link-dependency")
def link_control_dependency(
    control_id: str,
    req: LinkControlDependencyRequest,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Only admins and owners can link controls")
    try:
        db.execute(
            """
            INSERT INTO control_dependencies (source_control_id, related_control_id, relationship)
            VALUES (?, ?, ?)
            """,
            (control_id, req.related_control_id, req.relationship)
        )
        db.commit()
        log_activity(db, "Control Dependency", control_id, f"Linked dependency to {req.related_control_id} ({req.relationship})", user.id, user.name)
        return {"message": "Dependency link created"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Dependency link already exists or invalid control IDs")

@router.delete("/{control_id}/link-dependency/{related_control_id}")
def unlink_control_dependency(
    control_id: str,
    related_control_id: str,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Only admins and owners can unlink controls")
    cursor = db.execute(
        "DELETE FROM control_dependencies WHERE source_control_id = ? AND related_control_id = ?",
        (control_id, related_control_id)
    )
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Dependency link not found")
    log_activity(db, "Control Dependency", control_id, f"Removed dependency link to {related_control_id}", user.id, user.name)
    return {"message": "Dependency link removed"}
