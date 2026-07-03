import sqlite3
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.db.database import get_db
from src.dependencies import get_current_user, User

router = APIRouter()

class ActivityLogResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    action: str
    actor_id: Optional[str]
    actor_name: Optional[str]
    timestamp: str

@router.get("", response_model=List[ActivityLogResponse])
def list_activity_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    limit: int = 50,
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Retrieves system activity logs, optionally filtered by entity type or ID.
    Results are ordered by descending timestamp.
    """
    query = "SELECT * FROM activity_log WHERE 1=1"
    params = []
    
    if entity_type:
        query += " AND entity_type = ?"
        params.append(entity_type)
        
    if entity_id:
        query += " AND entity_id = ?"
        params.append(entity_id)
        
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor = db.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]
