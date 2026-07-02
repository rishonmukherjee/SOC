# SOC 2 Compliance Platform — Work Division
### 22North × Phonon Hackathon | 48-Hour Build Plan
**Team size:** 2 | Person A = Backend & Data | Person B = Frontend & Experience

---

## Current State of Repo

- ✅ React + Vite + Tailwind client scaffolded (`/client`)
- ✅ Sidebar + header shell complete (`App.jsx`)
- ❌ No routing yet
- ❌ No backend
- ❌ No screens built

---

## 🅰️ Person A — Backend & Data (Compliance Engine Owner)

> **Owns:** Server setup, database schema, all API endpoints, mock auth, audit logging, seed data, deployment.

---

### ⏱️ Hour-by-Hour Schedule

| Time Block | Task |
|---|---|
| Hr 0–2 | Finalize API contract + data model with Person B (DO NOT skip this) |
| Hr 2–8 | Project setup, DB schema, migrations, seed script |
| Hr 8–16 | Build Risks, Controls, Evidence APIs |
| Hr 16–20 | DPDP APIs + Audit-log middleware |
| Hr 20–24 | Dashboard aggregation endpoint |
| Hr 24–28 | 💤 Sleep |
| Hr 28–34 | Bug fixes from frontend integration; Should-Have APIs if time |
| Hr 34–40 | Deploy backend, seed final demo data, write API docs |
| Hr 40–48 | Joint: demo rehearsal, README, architecture diagram |

---

### 📁 Folder Structure to Create

```
/server
  /src
    /routes
      auth.js
      risks.js
      controls.js
      evidence.js
      dpdp.js
      dashboard.js
      activityLog.js
    /middleware
      mockAuth.js
      auditLogger.js
    /db
      schema.sql
      seed.js
      db.js          ← SQLite connection helper
    app.js
  package.json
  .env
```

---

### Task 1 — Project Setup (Hr 2–4)

**Steps:**
1. `cd server && npm init -y`
2. Install: `express`, `better-sqlite3`, `multer` (file uploads), `cors`, `dotenv`, `uuid`
3. Create `app.js` with Express boilerplate, CORS enabled, JSON body parser
4. Create `.env` with `PORT=3001`
5. Mount all routers under `/api/v1`
6. Add `npm run dev` script using `nodemon`

---

### Task 2 — Database Schema (Hr 4–6)

Create `/db/schema.sql` and run it on startup via `db.js`.

**Tables to create:**

```sql
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
```

---

### Task 3 — Seed Script (Hr 6–8)

File: `/db/seed.js` — run once with `node src/db/seed.js`

**Seed data to insert:**

**Users (3):**
| ID | Name | Role |
|---|---|---|
| `user-admin` | Priya Sharma | admin |
| `user-owner` | Arjun Mehta | owner |
| `user-auditor` | Meera Iyer | auditor |

**Controls (15 — pre-seeded, no UI create needed):**

| # | Name | Trust Criteria | Status | Owner |
|---|---|---|---|---|
| C01 | Logical Access Controls | Security | In Progress | Arjun |
| C02 | Multi-Factor Authentication | Security | Implemented | Arjun |
| C03 | Encryption at Rest | Security | Not Started | Arjun |
| C04 | Encryption in Transit | Security | Implemented | Arjun |
| C05 | Vulnerability Management | Security | In Progress | Arjun |
| C06 | Incident Response Plan | Security | Not Started | Priya |
| C07 | Change Management | Security | Verified | Arjun |
| C08 | Availability Monitoring | Availability | In Progress | Arjun |
| C09 | Backup & Recovery | Availability | Not Started | Arjun |
| C10 | Disaster Recovery Plan | Availability | Not Started | Priya |
| C11 | Data Classification | Confidentiality | Not Started | Priya |
| C12 | Third-Party Risk Management | Confidentiality | In Progress | Priya |
| C13 | Data Retention & Disposal | Confidentiality | Not Started | Priya |
| C14 | Security Awareness Training | Security | Implemented | Priya |
| C15 | Access Review (Quarterly) | Security | In Progress | Arjun |

**Sample Risks (3):**
- "Vendor sub-processor lacks DPA" — Likelihood 4, Impact 5 → Score 20, Open, linked to C12
- "Weak password policy" — Likelihood 3, Impact 4 → Score 12, Open, linked to C01
- "No DR plan tested" — Likelihood 2, Impact 5 → Score 10, Open, linked to C10

**Sample Evidence (3):**
- Against C15: "Q1 Access Review spreadsheet.csv" — Pending Review, uploaded by Arjun
- Against C02: "MFA screenshot.png" — Approved, reviewed by Priya
- Against C07: "Change log export.pdf" — Approved, reviewed by Priya

**Sample DPDP Requests (3):**
- "Erasure Request" from "Rohit Kumar" — received 10 days ago, due in 20 days, Open
- "Access Request" from "Sneha Patel" — received 25 days ago, due in 5 days, In Progress, assigned Priya
- "Correction Request" from "Vivek Singh" — received 5 days ago, due in 25 days, Open

**Sample Consent Log (2):**
- "Rohit Kumar" — Purpose: "Marketing emails" — Withdrawn
- "Sneha Patel" — Purpose: "Product analytics" — Given

---

### Task 4 — Mock Auth Middleware (Hr 8)

File: `/middleware/mockAuth.js`

```js
// Reads X-Role and X-User-Id headers set by the frontend after mock login
// Attaches req.user = { id, name, role } to every request
// Returns 401 if headers missing
```

File: `/routes/auth.js` — `POST /api/v1/auth/login`
```js
// Body: { name, role }
// Returns: { userId, name, role } — no real JWT needed
// Frontend stores this in localStorage
```

---

### Task 5 — Risks API (Hr 8–11)

File: `/routes/risks.js`

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/risks` | Optional query: `?status=Open&minScore=10` |
| `POST` | `/risks` | Body: `{title, description, likelihood, impact}` — score auto-calc |
| `GET` | `/risks/:id` | Include linked controls in response |
| `PATCH` | `/risks/:id` | Update title/description/likelihood/impact/status |
| `POST` | `/risks/:id/link-control` | Body: `{controlId}` |
| `DELETE` | `/risks/:id/link-control/:controlId` | Unlink |

**Auto-log to activity_log on every POST/PATCH.**

---

### Task 6 — Controls API (Hr 11–13)

File: `/routes/controls.js`

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/controls` | Optional query: `?status=&ownerId=&criteria=` |
| `GET` | `/controls/:id` | Include linked risks + evidence list |
| `PATCH` | `/controls/:id` | Update status/owner only (no create/delete — pre-seeded) |

**Auto-log to activity_log on every PATCH.**

---

### Task 7 — Evidence API (Hr 13–16)

File: `/routes/evidence.js`  
Use `multer` for file uploads (store in `/uploads`).

| Method | Endpoint | Notes |
|---|---|---|
| `POST` | `/controls/:id/evidence` | Multipart (file) or JSON (link/text). Sets status=Pending Review, uploaded_by from auth |
| `GET` | `/evidence` | Optional: `?status=pending&controlId=` |
| `PATCH` | `/evidence/:id/review` | Body: `{status, comment}`. Only admin/auditor role. Sets reviewed_by. |

**Auto-log to activity_log on every mutation.**

---

### Task 8 — DPDP API (Hr 16–19)

File: `/routes/dpdp.js`

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/dpdp/requests` | Sorted by sla_due ASC |
| `POST` | `/dpdp/requests` | Body: `{request_type, data_principal_name, received_on}`. Auto-sets `sla_due = received_on + 30 days` |
| `PATCH` | `/dpdp/requests/:id` | Update status/assigned_to |
| `GET` | `/dpdp/consent-log` | List all consent records |
| `POST` | `/dpdp/consent-log` | Body: `{data_principal_name, purpose, consent_status}` |

**Auto-log to activity_log on every mutation.**

---

### Task 9 — Audit Log Middleware (Hr 19–20)

File: `/middleware/auditLogger.js`

```js
// Helper function: logActivity(db, { entityType, entityId, action, actor })
// Called manually at end of each mutating route handler
// Inserts into activity_log table
```

File: `/routes/activityLog.js`

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/activity-log` | Optional: `?entityType=risk&entityId=&limit=50` |

---

### Task 10 — Dashboard API (Hr 20–24)

File: `/routes/dashboard.js`

`GET /dashboard/summary` — single call returning:

```json
{
  "controlsTotal": 15,
  "controlsByStatus": {
    "Not Started": 6,
    "In Progress": 5,
    "Implemented": 3,
    "Verified": 1
  },
  "controlsImplementedPct": 27,
  "openRisksBySeverity": {
    "Critical (20-25)": 1,
    "High (15-19)": 0,
    "Medium (8-14)": 1,
    "Low (1-7)": 1
  },
  "evidencePendingCount": 1,
  "dpdpRequestsDueSoon": [
    { "id": "...", "data_principal_name": "Sneha Patel", "request_type": "Access", "sla_due": "2026-07-07", "daysLeft": 5 }
  ]
}
```

---

### Task 11 — Deployment (Hr 34–40)

1. Deploy backend to **Render** (free tier) or **Railway**
2. Set env vars on the hosting platform
3. Run seed script on deployed DB
4. Update frontend `.env` with deployed backend URL
5. Confirm all 10 API endpoints work via Postman/curl

---

### Stretch Tasks (Only if Must-Haves complete)

- `GET /risks/:id/graph` — return risk + its controls + their evidence as a nested JSON (for linking view)
- `GET /risks/export/csv` and `GET /controls/export/csv` — CSV download

---
---

## 🅱️ Person B — Frontend & Experience (Workflow Owner)

> **Owns:** All UI screens, routing, charts, role-based gating, demo narrative, pitch deck. **Dashboard is fully yours.**

---

### ⏱️ Hour-by-Hour Schedule

| Time Block | Task |
|---|---|
| Hr 0–2 | Finalize API contract + data model with Person A |
| Hr 2–8 | Mock login screen, routing setup, layout shell polish |
| Hr 8–16 | Risk Register screen + Control Library screen |
| Hr 16–20 | Evidence Repository screen |
| Hr 20–24 | DPDP Module screens |
| Hr 24–28 | 💤 Sleep |
| Hr 28–34 | **Dashboard screen** (charts + live data) |
| Hr 34–40 | Should-Have polish, responsive pass, role gating |
| Hr 40–48 | Joint: demo rehearsal, slides, record backup video |

---

### 📁 Folder Structure to Create

```
/client/src
  /components
    Sidebar.jsx         ← extract from App.jsx
    Header.jsx          ← extract from App.jsx
    StatCard.jsx        ← reusable metric card
    Badge.jsx           ← status badge (color-coded)
    Modal.jsx           ← reusable create/edit modal
    Table.jsx           ← reusable sortable table
    SLACountdown.jsx    ← countdown pill for DPDP
  /pages
    LoginPage.jsx
    DashboardPage.jsx
    RisksPage.jsx
    ControlsPage.jsx
    EvidencePage.jsx
    DPDPPage.jsx
    ActivityLogPage.jsx
  /hooks
    useApi.js           ← fetch wrapper that injects X-Role + X-User-Id headers
    useRole.js          ← reads role from localStorage
  /lib
    api.js              ← all API call functions
    constants.js        ← STATUS_COLORS, ROLE_LABELS, etc.
  App.jsx               ← update to use react-router
  main.jsx
```

---

### Task 1 — Install Dependencies (Hr 2)

```bash
cd client
npm install react-router-dom recharts
```

---

### Task 2 — Mock Login Screen (Hr 2–4)

File: `/pages/LoginPage.jsx`

**UI:**
- Centered card on black background
- App name "ComplianceOS" at top
- Dropdown: select role (Compliance Admin / Control Owner / Auditor)
- Name auto-fills based on role:
  - Admin → "Priya Sharma"
  - Owner → "Arjun Mehta"
  - Auditor → "Meera Iyer"
- "Sign In" button → calls `POST /api/v1/auth/login` → stores `{userId, name, role}` in localStorage → redirects to `/dashboard`

**Behavior:**
- On app load, if localStorage has a valid role, skip login
- "Switch Role" button in header to go back to login

---

### Task 3 — Routing Setup (Hr 4–5)

Update `App.jsx` to use `react-router-dom`:

```
/login              → LoginPage
/dashboard          → DashboardPage  (default redirect after login)
/risks              → RisksPage
/controls           → ControlsPage
/evidence           → EvidencePage
/dpdp               → DPDPPage
/activity           → ActivityLogPage
```

Protected route wrapper: redirect to `/login` if no localStorage session.

Sidebar nav items link to these routes.

---

### Task 4 — Risk Register Screen (Hr 8–12)

File: `/pages/RisksPage.jsx`

**Table columns:** Title | Likelihood | Impact | Score | Status | Linked Controls | Actions

**Score color coding:**
- 20–25 → red badge "Critical"
- 15–19 → orange badge "High"
- 8–14 → yellow badge "Medium"
- 1–7 → green badge "Low"

**Status badge colors:**
- Open → red
- Mitigated → green
- Accepted → gray

**Features:**
- Load risks from `GET /api/v1/risks`
- **Create Risk** button (admin only) → opens Modal with form:
  - Title (text), Description (textarea)
  - Likelihood slider 1–5, Impact slider 1–5
  - Score preview auto-updates as sliders move: `Score = L × I`
  - Submit → `POST /api/v1/risks`
- **Edit** button per row → same modal pre-filled → `PATCH /api/v1/risks/:id`
- **Link to Control** button per row → opens a select-control dropdown → `POST /api/v1/risks/:id/link-control`
- **Role gating:** Auditor sees no Create/Edit buttons

---

### Task 5 — Control Library Screen (Hr 12–16)

File: `/pages/ControlsPage.jsx`

**Table columns:** Name | Trust Criteria | Status | Owner | Linked Risks | Evidence Count | Actions

**Trust Criteria badge colors:**
- Security → blue
- Availability → purple
- Confidentiality → teal

**Status badge colors:**
- Not Started → gray
- In Progress → yellow
- Implemented → blue
- Verified → green

**Features:**
- Load from `GET /api/v1/controls`
- Click a row → expand/drawer to show:
  - Full description
  - List of linked risks
  - List of attached evidence (with status badges)
- **Update Status** dropdown (owner/admin only) → `PATCH /api/v1/controls/:id`
- **Assign Owner** (admin only) → `PATCH /api/v1/controls/:id`
- **Role gating:** Auditor sees everything read-only; Owner sees only controls assigned to them

---

### Task 6 — Evidence Repository Screen (Hr 16–20)

File: `/pages/EvidencePage.jsx`

**Table columns:** Control | File/Link | Uploaded By | Date | Status | Actions

**Status badge colors:**
- Pending Review → yellow
- Approved → green
- Rejected → red
- Needs Resubmission → orange

**Features:**
- Load from `GET /api/v1/evidence`
- Filter tabs: All | Pending Review | Approved | Rejected
- **Upload Evidence** button (owner/admin only) → Modal with:
  - Select control (dropdown)
  - Upload file OR paste link/text (toggle)
  - Submit → `POST /api/v1/controls/:id/evidence`
- **Approve / Reject / Request Resubmission** buttons per row (admin/auditor only) → `PATCH /api/v1/evidence/:id/review`
- **Role gating:** Owner can only upload, cannot approve; Auditor can approve/reject but not upload

---

### Task 7 — DPDP Module Screen (Hr 20–24)

File: `/pages/DPDPPage.jsx`

**Two tabs: "Data Principal Requests" and "Consent Log"**

#### Tab 1 — Data Principal Requests

**Table columns:** Name | Type | Status | Received On | SLA Due | Days Left | Assigned To | Actions

**SLA Countdown component (`SLACountdown.jsx`):**
- Green pill if > 10 days left
- Yellow pill if 6–10 days left
- Red pill (blinking) if ≤ 5 days left
- "OVERDUE" in dark red if past due

**Features:**
- Load from `GET /api/v1/dpdp/requests`
- **Log New Request** button (admin only) → Modal:
  - Request Type: Access / Erasure / Correction (radio)
  - Data Principal Name (text)
  - Received On (date picker, default today)
  - SLA Due auto-shows as "received_on + 30 days"
  - Submit → `POST /api/v1/dpdp/requests`
- **Assign** and **Update Status** per row (admin only) → `PATCH /api/v1/dpdp/requests/:id`

#### Tab 2 — Consent Log

**Table columns:** Data Principal | Purpose | Consent Status | Timestamp

**Consent Status badge:**
- Given → green
- Withdrawn → red
- Pending → yellow

**Features:**
- Load from `GET /api/v1/dpdp/consent-log`
- **Add Consent Record** button (admin only) → Modal → `POST /api/v1/dpdp/consent-log`

---

### Task 8 — Dashboard Screen ✅ (Hr 28–34) — YOUR MAIN DELIVERABLE

File: `/pages/DashboardPage.jsx`

> This is the "wow" screen. It should look stunning and update live after any action.

**Load data from:** `GET /api/v1/dashboard/summary`

**Layout — 4 rows:**

#### Row 1 — Stat Cards (4 cards)

| Card | Value | Color |
|---|---|---|
| Controls Implemented | `27%` (progress ring) | Blue |
| Open Risks | Count, colored by highest severity present | Red/Orange |
| Evidence Pending Review | Count | Yellow |
| DPDP Requests Due Soon (≤7 days) | Count | Purple |

Use `StatCard.jsx` component.

#### Row 2 — Charts (2 charts side by side)

**Chart 1 — Control Status Donut (Recharts `PieChart`):**
- Segments: Not Started (gray), In Progress (yellow), Implemented (blue), Verified (green)
- Center label: "15 Controls"
- Legend below

**Chart 2 — Open Risks by Severity Bar Chart (Recharts `BarChart`):**
- X-axis: Critical / High / Medium / Low
- Y-axis: Count
- Bar colors match severity (red/orange/yellow/green)

#### Row 3 — Evidence Pending Review (table, max 5 rows)

Columns: Control Name | Uploaded By | Date | Status badge | Quick Action (Approve/Reject buttons — admin only)

On approve/reject → call `PATCH /api/v1/evidence/:id/review` → refresh dashboard data

#### Row 4 — DPDP Requests Due Soon (list, sorted by sla_due ASC)

For each: Name | Type badge | `SLACountdown` pill | Assigned To

---

### Task 9 — Activity Log Screen (Hr 34–36)

File: `/pages/ActivityLogPage.jsx`

**Table columns:** Timestamp | Actor | Action | Entity Type | Entity (linked) | Details

**Features:**
- Load from `GET /api/v1/activity-log`
- Filter by entity type (Risk / Control / Evidence / DPDP)
- Newest first
- All roles can view (read-only for all)

---

### Task 10 — Role-Based UI Gating (Hr 36–38)

Use `useRole()` hook to conditionally render:

| Element | Admin | Owner | Auditor |
|---|---|---|---|
| Create Risk button | ✅ | ❌ | ❌ |
| Edit Risk button | ✅ | ❌ | ❌ |
| Update Control status | ✅ | ✅ (own only) | ❌ |
| Upload Evidence | ✅ | ✅ (own controls) | ❌ |
| Approve/Reject Evidence | ✅ | ❌ | ✅ |
| Log DPDP Request | ✅ | ❌ | ❌ |
| Add Consent Record | ✅ | ❌ | ❌ |
| Activity Log | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |

---

### Stretch Tasks (Only if Must-Haves complete)

- Search/filter on all tables (client-side filter)
- In-app toast notifications (e.g. "Evidence approved ✓")
- Risk↔Control↔Evidence linking graph view (tree layout)
- Responsive layout (mobile-friendly sidebar collapse)

---
---

## 🔗 Shared API Contract (Lock in Hr 0–2)

> **Do not change field names after this is agreed. Use mock JSON on frontend until backend is ready.**

**Base URL:** `http://localhost:3001/api/v1`

**Auth headers on every request:**
```
X-Role: admin | owner | auditor
X-User-Id: user-admin | user-owner | user-auditor
```

**Mock JSON files for Person B to use while waiting for Person A's API:**
Create `/client/src/lib/mockData.js` with realistic data matching the seed script above.

---

## 🔁 Sync Checkpoints

| Checkpoint | Time | Goal |
|---|---|---|
| Sync 1 | Hr 8 | API contract locked, login + routing works, risks/controls API ready |
| Sync 2 | Hr 16 | Risk + Control screens done, Evidence API ready |
| Sync 3 | Hr 24 | Evidence + DPDP screens done, all APIs done |
| Sync 4 | Hr 34 | Dashboard done, deploy done, should-haves started |
| Sync 5 | Hr 40 | Feature freeze — demo rehearsal begins |

---

## 📋 Final Deliverable Checklist

- [ ] Mock login with 3 roles
- [ ] Risk Register (create, edit, link to control, auto score)
- [ ] Control Library (15 pre-seeded, update status/owner)
- [ ] Evidence Repository (upload, approve/reject)
- [ ] DPDP Module (requests + SLA countdown + consent log)
- [ ] Dashboard (stat cards + charts + pending lists)
- [ ] Activity Log (full audit trail)
- [ ] All APIs deployed on Render/Railway
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Seed data loaded on deployed instance
- [ ] Backup demo video recorded by Hr 44
- [ ] README updated with setup instructions
