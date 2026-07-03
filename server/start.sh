#!/bin/bash

# Initialize the database with schema
echo "Initializing Database..."
python -c "from src.db.database import init_db; init_db()"

# Seed the database with our demo data
echo "Seeding Database..."
python src/db/seed.py

# Start the FastAPI server
echo "Starting FastAPI Server..."
uvicorn src.main:app --host 0.0.0.0 --port $PORT
