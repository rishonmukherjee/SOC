import sqlite3
import os
import sys
from datetime import date, timedelta, datetime

# Adjust path to root of the server
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.db.database import DB_FILE, init_db

def seed():
    print(f"Deleting existing database file: {DB_FILE}")
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
        except Exception as e:
            # If the database is locked, drop tables instead
            print(f"Could not delete database file, dropping tables instead: {e}")
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS activity_log")
            cursor.execute("DROP TABLE IF EXISTS control_dependencies")
            cursor.execute("DROP TABLE IF EXISTS consent_log")
            cursor.execute("DROP TABLE IF EXISTS dpdp_requests")
            cursor.execute("DROP TABLE IF EXISTS evidence")
            cursor.execute("DROP TABLE IF EXISTS risk_control_links")
            cursor.execute("DROP TABLE IF EXISTS controls")
            cursor.execute("DROP TABLE IF EXISTS risks")
            cursor.execute("DROP TABLE IF EXISTS users")
            conn.commit()
            conn.close()

    print("Initializing database...")
    init_db()

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Seed Users
        cursor.executemany(
            "INSERT INTO users (id, name, role) VALUES (?, ?, ?)",
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
            "INSERT INTO controls (id, name, trust_criteria, status, owner_id) VALUES (?, ?, ?, ?, ?)",
            controls
        )

        # Control Dependencies
        control_dependencies = [
            ('C01', 'C02', 'supplements'), # Logical Access supplemented by MFA
            ('C03', 'C04', 'supplements'), # Encryption at rest supplemented by Encryption in Transit
            ('C09', 'C10', 'depends_on'),  # Backup depends on DR Plan
            ('C05', 'C06', 'supplements'), # Vulnerability Management supplemented by Incident Response
            ('C11', 'C13', 'depends_on'),  # Data Classification depends on Data Retention
        ]
        cursor.executemany(
            "INSERT INTO control_dependencies (source_control_id, related_control_id, relationship) VALUES (?, ?, ?)",
            control_dependencies
        )

        # Seed Risks
        risks = [
            ('R01', 'Vendor sub-processor lacks DPA', 'A key vendor has not signed a Data Processing Agreement.', 4, 5, 'Open'), # score = 20 (Critical)
            ('R02', 'Weak password policy', 'Current policy does not enforce complexity or rotation.', 3, 4, 'Open'), # score = 12 (Medium)
            ('R03', 'No DR plan tested', 'Disaster recovery plan exists but has not been tested in 2 years.', 2, 5, 'Open'), # score = 10 (Medium)
            ('R04', 'External API endpoint exposed', 'A legacy API endpoint lacks authentication.', 5, 4, 'Open'), # score = 20 (Critical)
            ('R05', 'Insufficient logging', 'Lack of centralized logs prevents effective auditing.', 2, 3, 'Open'), # score = 6 (Low)
        ]
        cursor.executemany(
            "INSERT INTO risks (id, title, description, likelihood, impact, status) VALUES (?, ?, ?, ?, ?, ?)",
            risks
        )

        # Link Risks and Controls
        cursor.executemany(
            "INSERT INTO risk_control_links (risk_id, control_id) VALUES (?, ?)",
            [
                ('R01', 'C12'),
                ('R02', 'C01'),
                ('R02', 'C02'),
                ('R03', 'C09'),
                ('R03', 'C10'),
                ('R04', 'C01'),
                ('R04', 'C05'),
                ('R05', 'C08'),
            ]
        )

        # Seed Evidence
        today = date.today()
        def days_ago(d):
            return (datetime.now() - timedelta(days=d)).strftime('%Y-%m-%d %H:%M:%S')

        evidence = [
            ('E01', 'C02', '/uploads/mfa_config.png', 'Approved', 'user-owner', 'user-auditor', None, days_ago(5)),
            ('E02', 'C04', '/uploads/ssl_cert.pdf', 'Approved', 'user-owner', 'user-auditor', None, days_ago(4)),
            ('E03', 'C07', '/uploads/change_approval_logs.txt', 'Rejected', 'user-owner', 'user-auditor', 'Missing manager approval signature for deployment log #24.', days_ago(3)),
            ('E04', 'C01', '/uploads/access_review_q2.csv', 'Pending Review', 'user-owner', None, None, days_ago(2)),
            ('E05', 'C14', '/uploads/training_completion_report.pdf', 'Pending Review', 'user-admin', None, None, days_ago(1)),
            ('E06', 'C05', '/uploads/vulnerability_scan_june.pdf', 'Needs Resubmission', 'user-owner', 'user-auditor', 'Scan report is from a development sandbox environment. Please provide production scan results.', days_ago(1))
        ]
        cursor.executemany(
            "INSERT INTO evidence (id, control_id, file_url_or_text, status, uploaded_by, reviewed_by, rejection_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            evidence
        )

        # Seed DPDP Requests
        dpdp_requests = [
            ('D01', 'Access', 'Amit Patel', 'Open', str(today - timedelta(days=27)), str(today + timedelta(days=3)), 'user-admin'),
            ('D02', 'Erasure', 'Sneha Reddy', 'In Progress', str(today - timedelta(days=15)), str(today + timedelta(days=15)), 'user-admin'),
            ('D03', 'Correction', 'Vikram Singh', 'Open', str(today - timedelta(days=2)), str(today + timedelta(days=28)), 'user-owner'),
            ('D04', 'Access', 'Deepa Nair', 'Completed', str(today - timedelta(days=40)), str(today - timedelta(days=10)), 'user-admin'),
            ('D05', 'Erasure', 'Karan Johar', 'Rejected', str(today - timedelta(days=10)), str(today + timedelta(days=20)), 'user-admin')
        ]
        cursor.executemany(
            "INSERT INTO dpdp_requests (id, request_type, data_principal_name, status, received_on, sla_due, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)",
            dpdp_requests
        )

        # Seed Consent Log
        consent_log = [
            ('CL01', 'Sneha Reddy', 'Newsletter Subscription Emails', 'Given', days_ago(15)),
            ('CL02', 'Vikram Singh', 'Product Feedback Surveys', 'Given', days_ago(2)),
            ('CL03', 'Amit Patel', 'Third-party data sharing for analytics', 'Withdrawn', days_ago(1)),
            ('CL04', 'Deepa Nair', 'Weekly Digest Emails', 'Pending', days_ago(10))
        ]
        cursor.executemany(
            "INSERT INTO consent_log (id, data_principal_name, purpose, consent_status, timestamp) VALUES (?, ?, ?, ?, ?)",
            consent_log
        )

        # Seed Coherent Activity Log
        activity_log = [
            ('A01', 'Risk', 'R01', 'Created Risk: Vendor sub-processor lacks DPA', 'user-admin', 'Priya Sharma', days_ago(7)),
            ('A02', 'Risk', 'R02', 'Created Risk: Weak password policy', 'user-admin', 'Priya Sharma', days_ago(7)),
            ('A03', 'Control', 'C12', 'Linked Control C12 to Risk R01', 'user-admin', 'Priya Sharma', days_ago(6)),
            ('A04', 'Control', 'C01', 'Linked Control C01 to Risk R02', 'user-admin', 'Priya Sharma', days_ago(6)),
            ('A05', 'Control', 'C02', 'Updated status to Implemented', 'user-owner', 'Arjun Mehta', days_ago(5)),
            ('A06', 'Evidence', 'E01', 'Uploaded evidence for Control C02', 'user-owner', 'Arjun Mehta', days_ago(5)),
            ('A07', 'Evidence', 'E01', 'Reviewed evidence: Approved', 'user-auditor', 'Meera Iyer', days_ago(5)),
            ('A08', 'Evidence', 'E02', 'Uploaded evidence for Control C04', 'user-owner', 'Arjun Mehta', days_ago(4)),
            ('A09', 'Evidence', 'E02', 'Reviewed evidence: Approved', 'user-auditor', 'Meera Iyer', days_ago(4)),
            ('A10', 'Evidence', 'E03', 'Uploaded evidence for Control C07', 'user-owner', 'Arjun Mehta', days_ago(3)),
            ('A11', 'Evidence', 'E03', 'Reviewed evidence: Rejected', 'user-auditor', 'Meera Iyer', days_ago(3)),
            ('A12', 'DPDP Request', 'D01', 'Logged new Access request for Amit Patel', 'user-admin', 'Priya Sharma', days_ago(2)),
            ('A13', 'Consent Log', 'CL03', 'Logged consent status \'Withdrawn\' for Amit Patel', 'user-admin', 'Priya Sharma', days_ago(1)),
            ('A14', 'Evidence', 'E05', 'Uploaded evidence for Control C14', 'user-admin', 'Priya Sharma', days_ago(1)),
            ('A15', 'Risk', 'R04', 'Created Risk: External API endpoint exposed', 'user-admin', 'Priya Sharma', days_ago(1)),
            ('A16', 'Control', 'C01', 'Updated status to In Progress', 'user-owner', 'Arjun Mehta', days_ago(1)),
            ('A17', 'Evidence', 'E04', 'Uploaded evidence for Control C01', 'user-owner', 'Arjun Mehta', days_ago(0))
        ]
        cursor.executemany(
            "INSERT INTO activity_log (id, entity_type, entity_id, action, actor_id, actor_name, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
            activity_log
        )

        conn.commit()
        print("Database initialized and seeded successfully with rich demo data!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
