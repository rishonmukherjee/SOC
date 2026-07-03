# ComplianceOS

A unified compliance management platform for SOC 2 readiness and DPDP Act, 2023 adherence. Built for organizations that need a single pane of glass across risk management, control implementation, evidence collection, and data principal rights workflows.

**Team Name:** Rajma Rockets

| Member | Email |
|---|---|
| Ayushmaan Sinha | ayushmaansinha@gmail.com |
| Rishon Mukherjee | rishonmukherjee@gmail.com |

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | [https://soc-ivory.vercel.app/login](https://soc-ivory.vercel.app/login) |
| Backend API (Render) | [https://soc-1t07.onrender.com](https://soc-1t07.onrender.com) |

---

## Problem Statement

Organizations pursuing SOC 2 certification or subject to the DPDP Act face a common set of operational challenges:

- Compliance tracking is fragmented across spreadsheets, emails, and disconnected tools with no single source of truth.
- There is no formal, auditable workflow for handling data principal rights requests (Access, Erasure, Correction) within the 30-day SLA mandated by the DPDP Act.
- Evidence chains linking identified risks to mitigating controls to proof of implementation are not maintained, making audit preparation time-consuming and error-prone.
- When a data principal request or evidence submission is rejected, there is no mechanism to document the justification, exposing the organization to regulatory risk.
- Controls are treated as isolated checkboxes with no visibility into how one control's failure cascades to others, making it impossible to assess systemic risk during an audit.

---

## What Sets ComplianceOS Apart

**Control-to-Control Dependency Mapping.** Most compliance tools treat controls as a flat checklist. In reality, controls are interdependent. A failed Disaster Recovery Plan renders a Backup and Recovery control incomplete. An MFA implementation supplements, but does not replace, Logical Access Controls. ComplianceOS models these relationships explicitly through typed dependency links (supplements, depends_on, replaces) between controls. This gives compliance teams and auditors a clear picture of how control failures propagate and which controls are prerequisites for others, turning a static checklist into a dependency-aware compliance graph.

**Mandatory Rejection Audit Trail.** Under the DPDP Act, rejecting a data principal's request without documented justification is a regulatory violation. ComplianceOS enforces documented rejection reasons at both the UI and API layers for DPDP requests and evidence reviews, ensuring every rejection is defensible.

**Unified SOC 2 and DPDP Workflow.** Rather than requiring separate tools for SOC 2 readiness and DPDP compliance, ComplianceOS integrates both frameworks into a single platform with shared activity logging, role-based access, and a common evidence chain.

---

## Key Features

### Risk Register
Log and score organizational risks using a 5x5 likelihood-impact matrix. Risk scores are auto-calculated at the database level. Link risks to one or more mitigating controls to build a traceable risk-to-control mapping.

### Controls Library
Manage SOC 2 controls organized by Trust Services Criteria (Security, Availability, Confidentiality). Assign control owners and track implementation status through four stages (Not Started, In Progress, Implemented, Verified). Controls can be linked to other controls through typed dependency relationships:

- **supplements**: One control strengthens another (e.g., MFA supplements Logical Access Controls).
- **depends_on**: One control cannot be verified without another being in place first (e.g., Backup and Recovery depends on a Disaster Recovery Plan).
- **replaces**: One control supersedes another.

These dependency links surface cascading risks and prerequisite gaps that flat checklists cannot capture.

### Evidence Repository
Upload files or reference links as evidence against specific controls. Evidence enters a formal review workflow where an auditor approves, rejects (with a mandatory documented reason), or requests resubmission. Every state transition is recorded to the audit log.

### DPDP Module
Log incoming data principal rights requests with automatic SLA deadline calculation (received date + 30 days). Track consent declarations (Given, Withdrawn, Pending) for specific processing purposes. When rejecting a request, the platform enforces a mandatory rejection reason to maintain a defensible audit trail.

### Activity Logs
An append-only, immutable audit trail that records every state change across all modules. Each entry captures the entity type, entity ID, action description, actor identity, and timestamp. Filterable by module.

### Role-Based Access Control
Three distinct personas with enforced permissions:

| Capability | Admin | Owner | Auditor |
|---|---|---|---|
| View all modules | Yes | Yes | Yes |
| Create and manage risks | Yes | Yes | No |
| Update control status | Yes | Yes | No |
| Reassign control owners | Yes | No | No |
| Upload evidence | Yes | Yes | No |
| Review evidence | Yes | No | Yes |
| Manage DPDP requests | Yes | No | No |
| Record consent | Yes | No | No |

Auditors are explicitly prevented from being assigned to Erasure-type DPDP requests. This rule is enforced at both the frontend and API layers.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite, Tailwind CSS | Single-page application with role-based views |
| Routing | React Router v6 | Declarative client-side routing |
| Icons | Lucide React | Consistent SVG icon set |
| Backend | Python 3.11, FastAPI | RESTful API with Pydantic validation |
| Server | Uvicorn | ASGI server for FastAPI |
| Database | SQLite 3 | Zero-configuration relational storage |
| Frontend Hosting | Vercel | Global CDN with API proxy rewrites |
| Backend Hosting | Render | Managed container hosting with auto-deploy |

---

## Architecture Overview

```
Browser
  |
  | HTTPS
  v
Vercel (CDN)
  - Serves static React build
  - Rewrites /api/* and /uploads/* to Render
  |
  | HTTPS (proxied)
  v
Render (Web Service)
  - FastAPI + Uvicorn
  - Header-based auth via get_current_user dependency
  - Transactional activity logging (log + mutation in one commit)
  |
  | sqlite3 driver
  v
SQLite (database.sqlite)
  - 8 normalized tables
  - Generated column for risk score
  - CHECK constraints on all enumerated fields
```

All API requests from the frontend are proxied through Vercel's rewrite rules to the Render backend, eliminating cross-origin issues without requiring CORS configuration on the server.

---

## Repository Structure

```
SOC/
  client/                       React frontend
    src/
      components/               Badge, Table, Modal, StatCard, Sidebar, Header, CreateRisk
      hooks/                    useRole (session and role management)
      layouts/                  DashboardLayout (sidebar + header + content area)
      lib/
        api.js                  Centralized fetch layer with auth header injection
      pages/                    DashboardPage, RisksPage, ControlsPage,
                                EvidencePage, DPDPPage, ActivityLogPage
    vercel.json                 Vercel rewrite rules for API proxying
  server/                       FastAPI backend
    src/
      db/
        schema.sql              DDL for all 8 tables with CHECK constraints
        database.py             Connection factory and schema initialization
        seed.py                 Demo data population (runs on every deploy)
      routers/                  auth, risks, controls, evidence, dpdp,
                                activity_log, dashboard
      utils/
        activity_logger.py      Shared audit log helper (non-committing)
      dependencies.py           get_current_user and get_db dependencies
      main.py                   App entrypoint, CORS middleware, router mount
    start.sh                    Render startup: init DB, seed, start server
    requirements.txt            Python dependencies
  docs/                         Submission documents (Architecture, API, DB Design)
  README.MD
```

---

## Local Development Setup

### Prerequisites

- Node.js 18 or later
- Python 3.11 or later

### Backend

```bash
cd server
pip install -r requirements.txt
python src/db/seed.py
uvicorn src.main:app --port 8000 --reload
```

The API will be available at `http://localhost:8000`. Interactive API docs are served at `http://localhost:8000/docs`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`. The Vite dev server is pre-configured to proxy `/api` requests to port 8000.

---

## Deployment

### Backend (Render)

1. Create a new Web Service on Render and connect this GitHub repository.
2. Set the Root Directory to `server`.
3. Set the Build Command to `pip install -r requirements.txt`.
4. Set the Start Command to `bash start.sh`.

The `start.sh` script initializes the database schema, seeds demo data, and starts Uvicorn. Because Render's free tier uses an ephemeral filesystem, the database is rebuilt fresh on every deploy, ensuring consistent demo data.

To prevent Render from spinning down the service after 15 minutes of inactivity, configure a free monitor (such as cron-job.org) to ping the backend URL every 10 to 14 minutes.

### Frontend (Vercel)

1. Create a new Project on Vercel and connect this GitHub repository.
2. Set the Root Directory to `client`.
3. Set the Framework Preset to Vite.
4. Deploy.

The `vercel.json` file handles all API routing automatically.

---

## Submission Documents

The following documents are available in the `docs/` directory for separate submission:

| Document | File |
|---|---|
| Architecture and Solution Design | `docs/01_architecture_solution_design.html` |
| API Documentation | `docs/02_api_documentation.html` |
| Database Design | `docs/03_database_design.html` |

Each document is a self-contained, print-ready HTML file. Open in any browser and use the "Save as PDF" button or press Ctrl+P to export.

---

## Design Decisions

**Mandatory Rejection Reasons.** Both the evidence review workflow and the DPDP request rejection workflow require a documented justification before a rejection status can be saved. This is enforced at the frontend (blocking prompt) and persisted at the database level, creating a durable audit record for every rejection decision.

**Transactional Activity Logging.** The `log_activity` helper writes within the same database transaction as the parent operation. The calling route commits both the data mutation and the log entry atomically. This guarantees the audit trail is never out of sync with the data it describes.

**Generated Risk Scores.** The risk `score` column is declared as `GENERATED ALWAYS AS (likelihood * impact) STORED` in SQLite. This eliminates any possibility of the score drifting from the underlying values and removes the need for application-layer calculation.

**Ephemeral Database Strategy.** Rather than migrating to a managed database service for the hackathon, the system embraces Render's ephemeral disk by re-seeding the database on every boot via `start.sh`. This guarantees a clean, predictable demo environment on every deployment.
