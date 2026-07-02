-- Users (3 hardcoded mock users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'owner', 'auditor'))
);

-- Risks
CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  likelihood INTEGER NOT NULL CHECK(likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK(impact BETWEEN 1 AND 5),
  score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open','Mitigated','Accepted')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Controls (pre-seeded, no POST needed)
CREATE TABLE IF NOT EXISTS controls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trust_criteria TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started'
    CHECK(status IN ('Not Started','In Progress','Implemented','Verified')),
  owner_id TEXT REFERENCES users(id)
);

-- Risk <-> Control many-to-many
CREATE TABLE IF NOT EXISTS risk_control_links (
  risk_id TEXT REFERENCES risks(id),
  control_id TEXT REFERENCES controls(id),
  PRIMARY KEY (risk_id, control_id)
);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  control_id TEXT NOT NULL REFERENCES controls(id),
  file_url_or_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Review'
    CHECK(status IN ('Pending Review','Approved','Rejected','Needs Resubmission')),
  uploaded_by TEXT REFERENCES users(id),
  reviewed_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DPDP Requests
CREATE TABLE IF NOT EXISTS dpdp_requests (
  id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL CHECK(request_type IN ('Access','Erasure','Correction')),
  data_principal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open'
    CHECK(status IN ('Open','In Progress','Completed','Rejected')),
  received_on DATE NOT NULL,
  sla_due DATE NOT NULL,  -- auto = received_on + 30 days
  assigned_to TEXT REFERENCES users(id)
);

-- Consent Log
CREATE TABLE IF NOT EXISTS consent_log (
  id TEXT PRIMARY KEY,
  data_principal_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  consent_status TEXT NOT NULL CHECK(consent_status IN ('Given','Withdrawn','Pending')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log (auto-written by middleware, never by routes directly)
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  actor_name TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
