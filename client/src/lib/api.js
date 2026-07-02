const BASE_URL = "/api";

// ─── Risks ────────────────────────────────────────────────────────────────────

export async function getRisks() {
  const res = await fetch(`${BASE_URL}/risks`);
  return res.json();
}

export async function createRisk(data) {
  const res = await fetch(`${BASE_URL}/risks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateRisk(id, data) {
  const res = await fetch(`${BASE_URL}/risks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteRisk(id) {
  const res = await fetch(`${BASE_URL}/risks/${id}`, { method: "DELETE" });
  return res.json();
}

// ─── Controls ─────────────────────────────────────────────────────────────────

export async function getControls() {
  const res = await fetch(`${BASE_URL}/controls`);
  return res.json();
}

export async function createControl(data) {
  const res = await fetch(`${BASE_URL}/controls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export async function getEvidence() {
  const res = await fetch(`${BASE_URL}/evidence`);
  return res.json();
}

export async function uploadEvidence(formData) {
  const res = await fetch(`${BASE_URL}/evidence`, {
    method: "POST",
    body: formData, // multipart/form-data — no Content-Type header needed
  });
  return res.json();
}

export async function updateEvidenceStatus(id, status) {
  const res = await fetch(`${BASE_URL}/evidence/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ─── DPDP ─────────────────────────────────────────────────────────────────────

export async function getDpdpRequests() {
  const res = await fetch(`${BASE_URL}/dpdp/requests`);
  return res.json();
}

export async function createDpdpRequest(data) {
  const res = await fetch(`${BASE_URL}/dpdp/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getConsentLog() {
  const res = await fetch(`${BASE_URL}/dpdp/consent`);
  return res.json();
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLogs() {
  const res = await fetch(`${BASE_URL}/activity`);
  return res.json();
}
