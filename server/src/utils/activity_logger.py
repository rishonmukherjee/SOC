import sqlite3
import uuid


def log_activity(
    db: sqlite3.Connection,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_id: str,
    actor_name: str,
) -> None:
    """
    Appends an entry to the activity_log table.

    Intentionally does NOT commit — the caller is responsible for committing
    so that the log write and the parent mutation share a single transaction.
    Failures are swallowed to prevent a logging issue from rolling back real data.
    """
    log_id = f"ACT-{uuid.uuid4().hex[:6].upper()}"
    try:
        db.execute(
            """
            INSERT INTO activity_log (id, entity_type, entity_id, action, actor_id, actor_name)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (log_id, entity_type, entity_id, action, actor_id, actor_name),
        )
    except Exception as exc:
        print(f"[activity_logger] Failed to write log entry: {exc}")
