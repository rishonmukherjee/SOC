import sqlite3
from typing import Generator

DB_FILE = "database.sqlite"

def init_db() -> None:
    """Initializes the database by executing the schema.sql script."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    cursor = conn.cursor()
    
    with open("src/db/schema.sql", "r") as f:
        schema = f.read()
        
    cursor.executescript(schema)
    conn.commit()
    conn.close()

def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    FastAPI dependency yielding a thread-safe database connection.
    Configured with sqlite3.Row for dictionary-like column access.
    """
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.close()
