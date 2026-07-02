export const mockUsers = [
  { id: 'user-admin', name: 'Priya Sharma', role: 'admin' },
  { id: 'user-owner', name: 'Arjun Mehta', role: 'owner' },
  { id: 'user-auditor', name: 'Meera Iyer', role: 'auditor' }
];

export const mockControls = [
  { id: 'C01', name: 'Logical Access Controls', trust_criteria: 'Security', status: 'In Progress', owner_id: 'user-owner' },
  { id: 'C02', name: 'Multi-Factor Authentication', trust_criteria: 'Security', status: 'Implemented', owner_id: 'user-owner' },
  { id: 'C03', name: 'Encryption at Rest', trust_criteria: 'Security', status: 'Not Started', owner_id: 'user-owner' },
  { id: 'C04', name: 'Encryption in Transit', trust_criteria: 'Security', status: 'Implemented', owner_id: 'user-owner' },
  { id: 'C05', name: 'Vulnerability Management', trust_criteria: 'Security', status: 'In Progress', owner_id: 'user-owner' },
  { id: 'C06', name: 'Incident Response Plan', trust_criteria: 'Security', status: 'Not Started', owner_id: 'user-admin' },
  { id: 'C07', name: 'Change Management', trust_criteria: 'Security', status: 'Verified', owner_id: 'user-owner' },
  { id: 'C08', name: 'Availability Monitoring', trust_criteria: 'Availability', status: 'In Progress', owner_id: 'user-owner' },
  { id: 'C09', name: 'Backup & Recovery', trust_criteria: 'Availability', status: 'Not Started', owner_id: 'user-owner' },
  { id: 'C10', name: 'Disaster Recovery Plan', trust_criteria: 'Availability', status: 'Not Started', owner_id: 'user-admin' },
  { id: 'C11', name: 'Data Classification', trust_criteria: 'Confidentiality', status: 'Not Started', owner_id: 'user-admin' },
  { id: 'C12', name: 'Third-Party Risk Management', trust_criteria: 'Confidentiality', status: 'In Progress', owner_id: 'user-admin' },
  { id: 'C13', name: 'Data Retention & Disposal', trust_criteria: 'Confidentiality', status: 'Not Started', owner_id: 'user-admin' },
  { id: 'C14', name: 'Security Awareness Training', trust_criteria: 'Security', status: 'Implemented', owner_id: 'user-admin' },
  { id: 'C15', name: 'Access Review (Quarterly)', trust_criteria: 'Security', status: 'In Progress', owner_id: 'user-owner' }
];

export const mockRisks = [
  { id: 'R01', title: 'Vendor sub-processor lacks DPA', description: 'A key vendor has not signed a Data Processing Agreement.', likelihood: 4, impact: 5, score: 20, status: 'Open', linked_control_ids: ['C12'] },
  { id: 'R02', title: 'Weak password policy', description: 'Current policy does not enforce complexity or rotation.', likelihood: 3, impact: 4, score: 12, status: 'Open', linked_control_ids: ['C01'] },
  { id: 'R03', title: 'No DR plan tested', description: 'Disaster recovery plan exists but has not been tested in 2 years.', likelihood: 2, impact: 5, score: 10, status: 'Open', linked_control_ids: ['C10'] }
];

export const mockEvidence = [
  { id: 'E01', control_id: 'C15', file_url_or_text: 'Q1 Access Review spreadsheet.csv', status: 'Pending Review', uploaded_by: 'user-owner', reviewed_by: null, created_at: '2026-07-01T10:00:00Z' },
  { id: 'E02', control_id: 'C02', file_url_or_text: 'MFA screenshot.png', status: 'Approved', uploaded_by: 'user-owner', reviewed_by: 'user-admin', created_at: '2026-06-25T14:30:00Z' },
  { id: 'E03', control_id: 'C07', file_url_or_text: 'Change log export.pdf', status: 'Approved', uploaded_by: 'user-owner', reviewed_by: 'user-admin', created_at: '2026-06-20T09:15:00Z' }
];

export const mockDPDPRequests = [
  { id: 'D01', request_type: 'Erasure', data_principal_name: 'Rohit Kumar', status: 'Open', received_on: '2026-06-22', sla_due: '2026-07-22', assigned_to: null },
  { id: 'D02', request_type: 'Access', data_principal_name: 'Sneha Patel', status: 'In Progress', received_on: '2026-06-07', sla_due: '2026-07-07', assigned_to: 'user-admin' },
  { id: 'D03', request_type: 'Correction', data_principal_name: 'Vivek Singh', status: 'Open', received_on: '2026-06-27', sla_due: '2026-07-27', assigned_to: null }
];

export const mockConsentLog = [
  { id: 'CL01', data_principal_name: 'Rohit Kumar', purpose: 'Marketing emails', consent_status: 'Withdrawn', timestamp: '2026-06-22T08:00:00Z' },
  { id: 'CL02', data_principal_name: 'Sneha Patel', purpose: 'Product analytics', consent_status: 'Given', timestamp: '2026-05-15T11:20:00Z' }
];

export const mockDashboardSummary = {
  controlsTotal: 15,
  controlsByStatus: {
    "Not Started": 6,
    "In Progress": 5,
    "Implemented": 3,
    "Verified": 1
  },
  controlsImplementedPct: 27,
  openRisksBySeverity: {
    "Critical (20-25)": 1,
    "High (15-19)": 0,
    "Medium (8-14)": 1,
    "Low (1-7)": 1
  },
  evidencePendingCount: 1,
  dpdpRequestsDueSoon: [
    { id: 'D02', data_principal_name: 'Sneha Patel', request_type: 'Access', sla_due: '2026-07-07', daysLeft: 5 }
  ]
};
