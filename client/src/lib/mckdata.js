export const risks = [
  {
    id: 1,
    title: "Vendor sub-processor lacks DPA",
    likelihood: 4,
    impact: 5,
    score: 20,
    status: "Open",
  },
  {
    id: 2,
    title: "Weak password policy",
    likelihood: 3,
    impact: 4,
    score: 12,
    status: "Open",
  },
  {
    id: 3,
    title: "No disaster recovery testing",
    likelihood: 2,
    impact: 5,
    score: 10,
    status: "Mitigated",
  },
];
export const controls = [
  {
    id: 1,
    name: "Logical Access Controls",
    criteria: "Security",
    status: "In Progress",
    owner: "Arjun Mehta",
  },
  {
    id: 2,
    name: "Multi-Factor Authentication",
    criteria: "Security",
    status: "Implemented",
    owner: "Arjun Mehta",
  },
  {
    id: 3,
    name: "Disaster Recovery Plan",
    criteria: "Availability",
    status: "Not Started",
    owner: "Priya Sharma",
  },
];

export const evidence = [
  {
    id: 1,
    control: "Multi-Factor Authentication",
    file: "mfa_screenshot.png",
    uploadedBy: "Arjun Mehta",
    date: "2026-07-01",
    status: "Approved",
  },
  {
    id: 2,
    control: "Logical Access Controls",
    file: "Q2 Access Review.xlsx",
    uploadedBy: "Priya Sharma",
    date: "2026-07-02",
    status: "Pending Review",
  },
  {
    id: 3,
    control: "Disaster Recovery Plan",
    file: "dr_test_report.pdf",
    uploadedBy: "Arjun Mehta",
    date: "2026-06-28",
    status: "Rejected",
  },
];

export const dpdpRequests = [
  {
    id: 1,
    name: "Rohit Kumar",
    type: "Erasure",
    status: "Open",
    receivedOn: "2026-06-20",
    slaDue: "2026-07-20",
    daysLeft: 18,
    assignedTo: "Priya Sharma",
  },
  {
    id: 2,
    name: "Sneha Patel",
    type: "Access",
    status: "In Progress",
    receivedOn: "2026-06-10",
    slaDue: "2026-07-10",
    daysLeft: 8,
    assignedTo: "Priya Sharma",
  },
];

export const consentLog = [
  {
    id: 1,
    name: "Rohit Kumar",
    purpose: "Marketing Emails",
    status: "Withdrawn",
    timestamp: "2026-07-01",
  },
  {
    id: 2,
    name: "Sneha Patel",
    purpose: "Product Analytics",
    status: "Given",
    timestamp: "2026-07-02",
  },
];
export const activityLogs = [
  {
    id: 1,
    timestamp: "2026-07-02 09:15",
    user: "Priya Sharma",
    action: "Created Risk",
    module: "Risks",
    details: "Vendor sub-processor lacks DPA",
  },
  {
    id: 2,
    timestamp: "2026-07-02 10:05",
    user: "Arjun Mehta",
    action: "Uploaded Evidence",
    module: "Evidence",
    details: "MFA Screenshot",
  },
  {
    id: 3,
    timestamp: "2026-07-02 11:30",
    user: "Priya Sharma",
    action: "Updated Control",
    module: "Controls",
    details: "Logical Access Controls",
  },
  {
    id: 4,
    timestamp: "2026-07-02 13:40",
    user: "Rohit Kumar",
    action: "Submitted DPDP Request",
    module: "DPDP",
    details: "Erasure Request",
  },
];