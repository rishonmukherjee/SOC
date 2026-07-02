const BASE_URL = "/api";

// Helper to get authentication headers from localStorage
function getAuthHeaders() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    return {
      "X-User-Id": user.userId || "",
      "X-Role": user.role || "",
    };
  } catch (e) {
    return {};
  }
}

// ─── Authentication ────────────────────────────────────────────────────────────

export async function login(role) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to log in");
  }
  return res.json();
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary() {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

// ─── Risks ────────────────────────────────────────────────────────────────────

export async function getRisks() {
  const res = await fetch(`${BASE_URL}/risks`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function createRisk(data) {
  const res = await fetch(`${BASE_URL}/risks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      likelihood: Number(data.likelihood),
      impact: Number(data.impact),
    }),
  });
  return res.json();
}

export async function updateRisk(id, data) {
  const res = await fetch(`${BASE_URL}/risks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function linkControlToRisk(riskId, controlId) {
  const res = await fetch(`${BASE_URL}/risks/${riskId}/link-control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ control_id: controlId }),
  });
  return res.json();
}

export async function unlinkControlFromRisk(riskId, controlId) {
  const res = await fetch(`${BASE_URL}/risks/${riskId}/link-control/${controlId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

// ─── Controls ─────────────────────────────────────────────────────────────────

export async function getControls() {
  const res = await fetch(`${BASE_URL}/controls`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function getControl(id) {
  const res = await fetch(`${BASE_URL}/controls/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function updateControl(id, data) {
  const res = await fetch(`${BASE_URL}/controls/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function linkControlDependency(controlId, relatedControlId, relationship) {
  const res = await fetch(`${BASE_URL}/controls/${controlId}/link-dependency`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ related_control_id: relatedControlId, relationship }),
  });
  return res.json();
}

export async function unlinkControlDependency(controlId, relatedControlId) {
  const res = await fetch(`${BASE_URL}/controls/${controlId}/link-dependency/${relatedControlId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export async function getEvidence() {
  const res = await fetch(`${BASE_URL}/evidence`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function uploadEvidence(controlId, file, linkOrText) {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (linkOrText) {
    formData.append("link_or_text", linkOrText);
  }

  const res = await fetch(`${BASE_URL}/evidence/controls/${controlId}/evidence`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(), // Do NOT add Content-Type header; browser handles multipart boundaries automatically
    },
    body: formData,
  });
  return res.json();
}

export async function reviewEvidence(id, status, rejectionReason) {
  const res = await fetch(`${BASE_URL}/evidence/${id}/review`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status, rejection_reason: rejectionReason }),
  });
  return res.json();
}

// ─── DPDP ─────────────────────────────────────────────────────────────────────

export async function getDpdpRequests() {
  const res = await fetch(`${BASE_URL}/dpdp/requests`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function createDpdpRequest(data) {
  const res = await fetch(`${BASE_URL}/dpdp/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDpdpRequest(id, data) {
  const res = await fetch(`${BASE_URL}/dpdp/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getConsentLog() {
  const res = await fetch(`${BASE_URL}/dpdp/consent-log`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}

export async function createConsentLog(data) {
  const res = await fetch(`${BASE_URL}/dpdp/consent-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLogs() {
  const res = await fetch(`${BASE_URL}/activity-log`, {
    headers: { ...getAuthHeaders() },
  });
  return res.json();
}
