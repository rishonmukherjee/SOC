import sqlite3
import os

DB_FILE = "database.sqlite"

def seed():
    if not os.path.exists(DB_FILE):
        print("Database not found. Make sure to run the server once to initialize it.")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    try:
        # Seed Users
        cursor.executemany(
            "INSERT OR IGNORE INTO users (id, name, role) VALUES (?, ?, ?)",
            [
                ('user-admin', 'Priya Sharma', 'admin'),
                ('user-owner', 'Arjun Mehta', 'owner'),
                ('user-auditor', 'Meera Iyer', 'auditor')
            ]
        )

        # Seed Controls
        controls = [
            ('C01', 'Logical Access Controls', 'Security', 'In Progress', 'user-owner'),
            ('C02', 'Multi-Factor Authentication', 'Security', 'Implemented', 'user-owner'),
            ('C03', 'Encryption at Rest', 'Security', 'Not Started', 'user-owner'),
            ('C04', 'Encryption in Transit', 'Security', 'Implemented', 'user-owner'),
            ('C05', 'Vulnerability Management', 'Security', 'In Progress', 'user-owner'),
            ('C06', 'Incident Response Plan', 'Security', 'Not Started', 'user-admin'),
            ('C07', 'Change Management', 'Security', 'Verified', 'user-owner'),
            ('C08', 'Availability Monitoring', 'Availability', 'In Progress', 'user-owner'),
            ('C09', 'Backup & Recovery', 'Availability', 'Not Started', 'user-owner'),
            ('C10', 'Disaster Recovery Plan', 'Availability', 'Not Started', 'user-admin'),
            ('C11', 'Data Classification', 'Confidentiality', 'Not Started', 'user-admin'),
            ('C12', 'Third-Party Risk Management', 'Confidentiality', 'In Progress', 'user-admin'),
            ('C13', 'Data Retention & Disposal', 'Confidentiality', 'Not Started', 'user-admin'),
            ('C14', 'Security Awareness Training', 'Security', 'Implemented', 'user-admin'),
            ('C15', 'Access Review (Quarterly)', 'Security', 'In Progress', 'user-owner')
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO controls (id, name, trust_criteria, status, owner_id) VALUES (?, ?, ?, ?, ?)",
            controls
        )

        # Seed Risks
        risks = [
            ('R01', 'Vendor sub-processor lacks DPA', 'A key vendor has not signed a Data Processing Agreement.', 4, 5, 'Open'),
            ('R02', 'Weak password policy', 'Current policy does not enforce complexity or rotation.', 3, 4, 'Open'),
            ('R03', 'No DR plan tested', 'Disaster recovery plan exists but has not been tested in 2 years.', 2, 5, 'Open')
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO risks (id, title, description, likelihood, impact, status) VALUES (?, ?, ?, ?, ?, ?)",
            risks
        )

        # Link Risks and Controls
        cursor.executemany(
            "INSERT OR IGNORE INTO risk_control_links (risk_id, control_id) VALUES (?, ?)",
            [('R01', 'C12'), ('R02', 'C01'), ('R03', 'C10')]
        )

        conn.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
