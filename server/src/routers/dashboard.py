import sqlite3
from fastapi import APIRouter, Depends
from typing import List

from src.db.database import get_db
from src.dependencies import get_current_user, User
from pydantic import BaseModel

router = APIRouter()

class DPDPRequestSummary(BaseModel):
    id: str
    data_principal_name: str
    request_type: str
    sla_due: str
    daysLeft: int

class DashboardSummaryResponse(BaseModel):
    controlsTotal: int
    controlsByStatus: dict
    controlsImplementedPct: int
    openRisksBySeverity: dict
    evidencePendingCount: int
    dpdpRequestsDueSoon: List[DPDPRequestSummary]

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: sqlite3.Connection = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # 1. Controls counts
    cursor = db.execute("SELECT status, COUNT(*) as count FROM controls GROUP BY status")
    controls_rows = cursor.fetchall()
    
    controlsByStatus = {
        "Not Started": 0,
        "In Progress": 0,
        "Implemented": 0,
        "Verified": 0
    }
    
    controlsTotal = 0
    implemented_or_verified_count = 0
    
    for row in controls_rows:
        status = row["status"]
        count = row["count"]
        controlsByStatus[status] = count
        controlsTotal += count
        if status in ["Implemented", "Verified"]:
            implemented_or_verified_count += count
            
    controlsImplementedPct = 0
    if controlsTotal > 0:
        controlsImplementedPct = int((implemented_or_verified_count / controlsTotal) * 100)
        
    # 2. Open Risks by Severity (auto-calculated score)
    # 20-25 = Critical, 15-19 = High, 8-14 = Medium, 1-7 = Low
    cursor = db.execute("SELECT score FROM risks WHERE status = 'Open'")
    risk_rows = cursor.fetchall()
    
    openRisksBySeverity = {
        "Critical": 0,
        "High": 0,
        "Medium": 0,
        "Low": 0
    }
    
    for row in risk_rows:
        score = row["score"]
        if score >= 20:
            openRisksBySeverity["Critical"] += 1
        elif score >= 15:
            openRisksBySeverity["High"] += 1
        elif score >= 8:
            openRisksBySeverity["Medium"] += 1
        else:
            openRisksBySeverity["Low"] += 1
            
    # 3. Evidence Pending Count
    cursor = db.execute("SELECT COUNT(*) as count FROM evidence WHERE status = 'Pending Review'")
    evidencePendingCount = cursor.fetchone()["count"]
    
    # 4. DPDP Requests Due Soon (Next 30 days)
    # In SQLite, we can use julianday to calculate date differences
    cursor = db.execute(
        """
        SELECT id, data_principal_name, request_type, sla_due, 
               CAST(julianday(sla_due) - julianday('now') AS INTEGER) as daysLeft
        FROM dpdp_requests
        WHERE status NOT IN ('Completed', 'Rejected')
          AND CAST(julianday(sla_due) - julianday('now') AS INTEGER) <= 30
        ORDER BY daysLeft ASC
        LIMIT 5
        """
    )
    dpdp_rows = cursor.fetchall()
    dpdpRequestsDueSoon = [dict(r) for r in dpdp_rows]

    return DashboardSummaryResponse(
        controlsTotal=controlsTotal,
        controlsByStatus=controlsByStatus,
        controlsImplementedPct=controlsImplementedPct,
        openRisksBySeverity=openRisksBySeverity,
        evidencePendingCount=evidencePendingCount,
        dpdpRequestsDueSoon=dpdpRequestsDueSoon
    )
