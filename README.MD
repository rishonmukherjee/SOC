# ComplianceOS

**Team Name:** Rajma Rockets

| Member | Email |
|---|---|
| Ayushmaan Sinha | ayushmaansinha@gmail.com |
| Rishon Mukherjee | rishonmukherjee@gmail.com |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Solution Design](#2-solution-design)
3. [Architecture Documentation](#3-architecture-documentation)
4. [Database Design](#4-database-design)
5. [API Documentation](#5-api-documentation)
6. [Role-Based Access Control](#6-role-based-access-control)
7. [Deployment Guide](#7-deployment-guide)
8. [Local Development Setup](#8-local-development-setup)

---

## 1. Project Overview

ComplianceOS is a full-stack compliance management platform designed to address two converging regulatory requirements facing modern Indian organizations: the SOC 2 Trust Services Criteria framework and the Digital Personal Data Protection (DPDP) Act, 2023.

The platform provides a centralized, role-governed interface for managing risks, controls, evidence artifacts, and data principal requests. It generates an auditable, timestamped activity trail for every action taken, making it suitable for use as a demonstration or operational tool during a compliance audit.

**Core Problems Solved:**

- Fragmented compliance tracking across spreadsheets and emails
- No formal workflow for DPDP data principal requests (Access, Erasure, Correction)
- Lack of an evidence chain linking risks to controls to proof of implementation
- No documented rejection workflow for data erasure requests, which under DPDP must be accompanied by a legal or operational justification

---

## 2. Solution Design

### 2.1 Functional Modules

**Dashboard**
Provides an at-a-glance executive summary including the percentage of controls implemented, a breakdown of open risks by severity (Critical / High / Medium / Low), the number of evidence artifacts pending review, and a list of DPDP requests with SLA deadlines within the next 30 days.

**Risk Register**
Allows administrators and owners to log, score, and manage organizational risks. Each risk is scored automatically using a 5x5 likelihood-impact matrix. Risks can be linked to one or more mitigating controls, and their status can transition between Open, Mitigated, and Accepted.

**Controls Library**
Manages SOC 2 controls organized by Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy). Controls can be assigned to owners and linked to each other through typed dependency relationships (supplements, depends_on) to represent real-world control interdependencies.

**Evidence Repository**
Provides a formal upload and review workflow for compliance evidence. An owner uploads a file or link against a specific control. An auditor or administrator then reviews the artifact and sets its status to Approved, Rejected (with a documented reason), or Needs Resubmission. Every state change is recorded to the activity log.

**DPDP Module**
Implements the data principal rights management workflow required under the DPDP Act, 2023. Administrators log incoming Access, Erasure, or Correction requests. Each request receives an automatically calculated SLA deadline of 30 days from the received date. If a request is rejected, the platform mandates that the administrator document a formal rejection reason before the status change is saved, creating an auditable compliance record.

A separate Consent Log sub-section tracks consent declarations for specific data processing purposes, with statuses of Given, Withdrawn, or Pending.

**Activity Logs**
A read-only, append-only audit trail that records every state change across all modules. Each entry captures the entity type, entity ID, the action taken, and the actor name and ID. Logs can be filtered by module.

### 2.2 Design Decisions

**Mandatory Rejection Reasons**
Both the Evidence review workflow and the DPDP request rejection workflow require a documented reason before a rejection can be saved. This is enforced at both the frontend (a blocking prompt before the API call) and the backend (the field is stored and returned in all responses). This satisfies the compliance requirement for a traceable audit trail when rights cannot be fulfilled.

**Auditor Restrictions on Erasure Requests**
The DPDP module enforces a role-based rule preventing auditors from being assigned as the responsible party for Erasure (data deletion) requests. This is validated at the API layer in addition to the frontend to prevent circumvention.

**Transactional Activity Logging**
The activity logger does not issue its own database commit. Instead, it writes within the same database connection transaction as the parent operation. The parent route commits both the data change and the log entry atomically. This ensures the audit log is never out of sync with the data it describes.

---

## 3. Architecture Documentation

### 3.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | SQLite 3 |
| Icons | Lucide React |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Render |

### 3.2 Repository Structure

```
SOC/
  client/                   React frontend application
    src/
      components/           Reusable UI components (Badge, Table, Modal, StatCard)
      hooks/                useRole hook for session management
      layouts/              DashboardLayout with Sidebar and Header
      lib/
        api.js              Centralized fetch layer for all API calls
      pages/                One file per module page
    vercel.json             Vercel deployment and API proxy configuration
  server/                   FastAPI backend application
    src/
      db/
        schema.sql          DDL for all database tables
        database.py         SQLite connection factory and init function
        seed.py             Demo data population script
      routers/              One file per module (risks, controls, evidence, dpdp, etc.)
      utils/
        activity_logger.py  Shared helper for appending audit log entries
      dependencies.py       FastAPI shared dependencies (auth, role resolution)
      main.py               Application entrypoint, middleware, router registration
    start.sh                Render startup script (init, seed, serve)
```

### 3.3 Request Lifecycle

A typical API request follows this path:

1. The React frontend calls a function in `client/src/lib/api.js`.
2. The `api.js` function attaches `X-User-Id` and `X-Role` headers from `localStorage` and issues a `fetch` request to `/api/v1/...`.
3. On Vercel, the `vercel.json` rewrite rule proxies the request to the Render backend, eliminating any cross-origin concerns.
4. FastAPI receives the request and runs the `get_current_user` dependency, which reads the headers and constructs a `User` object.
5. The route handler runs business logic, calls `log_activity` if the action is a mutation, and commits the transaction.
6. The response is serialized via a Pydantic response model and returned as JSON.

### 3.4 Session and Authentication Model

ComplianceOS uses a simplified header-based authentication model suitable for a demonstration context. Upon login, the backend returns a user payload (ID, name, role) which the frontend stores in `localStorage`. Every subsequent API call reads this payload and sends the `X-User-Id` and `X-Role` headers. The backend resolves the user from these headers on every request.

A quick role switcher in the application header allows switching between the three personas (Admin, Owner, Auditor) without a separate login page, enabling rapid demonstration of role-based access differences.

---

## 4. Database Design

The database is implemented in SQLite. All IDs are human-readable prefixed strings (e.g., `R-`, `C-`, `E-`, `D-`) generated at the application layer using UUID hex fragments.

### 4.1 Entity Relationship Overview

```
users
  |
  +-- owns --> controls
  |
  +-- uploads --> evidence --> reviewed against --> controls
  |
  +-- assigned_to --> dpdp_requests

risks <--> controls  (via risk_control_links, many-to-many)

controls <--> controls  (via control_dependencies, many-to-many with relationship type)

activity_log  (append-only, references entity_type + entity_id loosely)
```

### 4.2 Table Definitions

**users**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| role | TEXT | CHECK IN ('admin', 'owner', 'auditor') |

**risks**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| title | TEXT | NOT NULL |
| description | TEXT | nullable |
| likelihood | INTEGER | CHECK BETWEEN 1 AND 5 |
| impact | INTEGER | CHECK BETWEEN 1 AND 5 |
| score | INTEGER | GENERATED ALWAYS AS (likelihood * impact) STORED |
| status | TEXT | DEFAULT 'Open', CHECK IN ('Open', 'Mitigated', 'Accepted') |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

The `score` column is a SQLite generated column, calculated automatically on insert or update.

**controls**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| trust_criteria | TEXT | NOT NULL |
| description | TEXT | nullable |
| status | TEXT | CHECK IN ('Not Started', 'In Progress', 'Implemented', 'Verified') |
| owner_id | TEXT | REFERENCES users(id) |

**risk_control_links**

| Column | Type | Constraints |
|---|---|---|
| risk_id | TEXT | REFERENCES risks(id) |
| control_id | TEXT | REFERENCES controls(id) |
| (risk_id, control_id) | | PRIMARY KEY (composite) |

**evidence**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| control_id | TEXT | NOT NULL, REFERENCES controls(id) |
| file_url_or_text | TEXT | NOT NULL |
| status | TEXT | CHECK IN ('Pending Review', 'Approved', 'Rejected', 'Needs Resubmission') |
| uploaded_by | TEXT | REFERENCES users(id) |
| reviewed_by | TEXT | REFERENCES users(id) |
| rejection_reason | TEXT | nullable |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**dpdp_requests**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| request_type | TEXT | CHECK IN ('Access', 'Erasure', 'Correction') |
| data_principal_name | TEXT | NOT NULL |
| status | TEXT | CHECK IN ('Open', 'In Progress', 'Completed', 'Rejected') |
| received_on | DATE | NOT NULL |
| sla_due | DATE | NOT NULL, auto-set to received_on + 30 days |
| assigned_to | TEXT | REFERENCES users(id) |
| rejection_reason | TEXT | Required when status is Rejected |

**consent_log**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| data_principal_name | TEXT | NOT NULL |
| purpose | TEXT | NOT NULL |
| consent_status | TEXT | CHECK IN ('Given', 'Withdrawn', 'Pending') |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**control_dependencies**

| Column | Type | Constraints |
|---|---|---|
| source_control_id | TEXT | REFERENCES controls(id) |
| related_control_id | TEXT | REFERENCES controls(id) |
| relationship | TEXT | CHECK IN ('supplements', 'depends_on', 'replaces') |
| (source, related) | | PRIMARY KEY (composite) |

**activity_log**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| entity_type | TEXT | NOT NULL (e.g., 'Risk', 'Evidence', 'DPDP Request') |
| entity_id | TEXT | NOT NULL |
| action | TEXT | NOT NULL |
| actor_id | TEXT | nullable |
| actor_name | TEXT | nullable |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 4.3 Risk Severity Thresholds

The dashboard classifies open risks by score using the following bands, derived from a standard 5x5 risk matrix:

| Score Range | Severity |
|---|---|
| 20 to 25 | Critical |
| 15 to 19 | High |
| 8 to 14 | Medium |
| 1 to 7 | Low |

---

## 5. API Documentation

The base URL for all endpoints is `/api/v1`. All requests require the `X-User-Id` and `X-Role` headers.

### 5.1 Authentication

**POST /api/v1/auth/login**

Authenticates a user by role and returns the session payload.

Request body:
```json
{ "role": "admin" }
```

Response:
```json
{ "userId": "user-admin", "name": "Priya Sharma", "role": "admin" }
```

### 5.2 Dashboard

**GET /api/v1/dashboard/summary**

Returns aggregated metrics for the executive dashboard. No query parameters.

Response fields: `controlsTotal`, `controlsByStatus`, `controlsImplementedPct`, `openRisksBySeverity`, `evidencePendingCount`, `dpdpRequestsDueSoon`.

### 5.3 Risks

**GET /api/v1/risks**

Returns all risks. Optional query parameter: `status` (e.g., `?status=Open`).

**POST /api/v1/risks**

Creates a new risk. Admin or Owner role required.

Request body:
```json
{
  "title": "string",
  "description": "string",
  "likelihood": 1,
  "impact": 1
}
```

**GET /api/v1/risks/{risk_id}**

Returns a single risk with its linked controls.

**PATCH /api/v1/risks/{risk_id}**

Partially updates a risk. Accepts any subset of `title`, `description`, `likelihood`, `impact`, `status`.

**POST /api/v1/risks/{risk_id}/link-control**

Links an existing control to a risk.

Request body: `{ "control_id": "string" }`

**DELETE /api/v1/risks/{risk_id}/link-control/{control_id}**

Removes a control link from a risk.

### 5.4 Controls

**GET /api/v1/controls**

Returns all controls with their dependency relationships. Optional query parameters: `status`, `owner_id`, `trust_criteria`.

**GET /api/v1/controls/{control_id}**

Returns a single control with linked risks, evidence, and dependencies.

**PATCH /api/v1/controls/{control_id}**

Updates a control's `status` or `owner_id`. Admin or Owner role required.

**POST /api/v1/controls/{control_id}/link-dependency**

Links a control dependency relationship. Admin or Owner role required.

Request body:
```json
{
  "related_control_id": "string",
  "relationship": "supplements"
}
```

Accepted relationship values: `supplements`, `depends_on`, `replaces`.

**DELETE /api/v1/controls/{control_id}/link-dependency/{related_control_id}**

Removes a control dependency link. Admin or Owner role required.

### 5.5 Evidence

**GET /api/v1/evidence**

Returns all evidence artifacts. Optional query parameters: `status`, `control_id`.

**POST /api/v1/evidence/controls/{control_id}/evidence**

Uploads an evidence artifact (file or link) for a specific control. Accepts `multipart/form-data` with either a `file` field or a `link_or_text` field.

**PATCH /api/v1/evidence/{evidence_id}/review**

Sets the review status of an evidence artifact. Admin or Auditor role required.

Request body:
```json
{
  "status": "Approved",
  "rejection_reason": "string or null"
}
```

Accepted status values: `Approved`, `Rejected`, `Needs Resubmission`.

### 5.6 DPDP

**GET /api/v1/dpdp/requests**

Returns all DPDP data principal requests, ordered by ascending SLA due date.

**POST /api/v1/dpdp/requests**

Logs a new DPDP request. Admin role required. SLA is automatically calculated as received_on + 30 days.

Request body:
```json
{
  "request_type": "Erasure",
  "data_principal_name": "string",
  "received_on": "2026-07-01"
}
```

Accepted request_type values: `Access`, `Erasure`, `Correction`.

**PATCH /api/v1/dpdp/requests/{request_id}**

Updates a DPDP request's status, assignee, or rejection reason. Admin role required. Auditors cannot be assigned to Erasure requests.

Request body:
```json
{
  "status": "Rejected",
  "assigned_to": "user-admin",
  "rejection_reason": "string"
}
```

**GET /api/v1/dpdp/consent-log**

Returns all consent log entries, ordered by descending timestamp.

**POST /api/v1/dpdp/consent-log**

Records a new consent entry. Admin role required.

Request body:
```json
{
  "data_principal_name": "string",
  "purpose": "string",
  "consent_status": "Given"
}
```

Accepted consent_status values: `Given`, `Withdrawn`, `Pending`.

### 5.7 Activity Log

**GET /api/v1/activity-log**

Returns system activity log entries. Defaults to the 50 most recent entries ordered by descending timestamp. Optional query parameters: `entity_type`, `entity_id`, `limit`.

---

## 6. Role-Based Access Control

| Action | Admin | Owner | Auditor |
|---|---|---|---|
| View all modules | Yes | Yes | Yes |
| Create / delete risks | Yes | Yes | No |
| Update control status | Yes | Yes | No |
| Reassign control owner | Yes | No | No |
| Upload evidence | Yes | Yes | No |
| Review evidence | Yes | No | Yes |
| Log DPDP requests | Yes | No | No |
| Update DPDP request status | Yes | No | No |
| Assign DPDP Erasure request | Yes (Admin/Owner only) | Yes | No |
| Record consent | Yes | No | No |
| View activity logs | Yes | Yes | Yes |

---

## 7. Deployment Guide

### 7.1 Backend on Render

1. Create a new Web Service on Render and connect the GitHub repository.
2. Set the Root Directory to `server`.
3. Set the Build Command to `pip install -r requirements.txt`.
4. Set the Start Command to `bash start.sh`.
5. The `start.sh` script will initialize the database schema, seed demo data, and start the Uvicorn server on the port provided by Render.

To prevent the free tier service from spinning down due to inactivity (Render idles services after 15 minutes with no traffic), configure a free external monitor such as Cron-job.org to send an HTTP GET request to the root endpoint every 14 minutes.

### 7.2 Frontend on Vercel

1. Create a new Project on Vercel and connect the GitHub repository.
2. Set the Root Directory to `client`.
3. Set the Framework Preset to Vite.
4. Open `client/vercel.json` and replace `YOUR_RENDER_URL` with the actual Render service URL before deploying.
5. The `vercel.json` rewrite configuration will proxy all `/api/*` and `/uploads/*` requests to the Render backend, eliminating cross-origin request issues.

---

## 8. Local Development Setup

### Prerequisites

- Node.js 18 or later
- Python 3.11 or later

### Backend

```bash
cd server
pip install fastapi uvicorn pydantic python-multipart
python src/db/seed.py
uvicorn src.main:app --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`. The Vite dev server is pre-configured to proxy `/api` requests to port 8000.
