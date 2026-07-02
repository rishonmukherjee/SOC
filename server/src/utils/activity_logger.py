import sqlite3
import uuid

def log_activity(db: sqlite3.Connection, entity_type: str, entity_id: str, action: str, actor_id: str, actor_name: str):
    """
    Helper function to log an activity to the activity_log table.
    """
    log_id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
    
    try:
        db.execute(
            """
            INSERT INTO activity_log (id, entity_type, entity_id, action, actor_id, actor_name)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (log_id, entity_type, entity_id, action, actor_id, actor_name)
        )
        # We don't commit here so that it can be part of the same transaction as the parent action
    except Exception as e:
        # In a production system, log this failure to a monitoring service
        # rather than crashing the parent transaction.
        print(f"Failed to write activity log: {e}")
