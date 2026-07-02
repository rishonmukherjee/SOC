import sqlite3
from typing import Generator

DB_FILE = "database.sqlite"

def init_db():
    """Initializes the database by running the schema.sql file."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    with open("src/db/schema.sql", "r") as f:
        schema = f.read()
        
    cursor.executescript(schema)
    conn.commit()
    conn.close()

def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Dependency that yields a database connection."""
    conn = sqlite3.connect(DB_FILE)
    # This allows accessing columns by name (e.g., row["id"])
    conn.row_factory = sqlite3.Row 
    try:
        yield conn
    finally:
        conn.close()
