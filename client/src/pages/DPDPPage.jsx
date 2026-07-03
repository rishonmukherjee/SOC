import { useState, useEffect } from "react";
import { Plus, Filter, Calendar } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import {
  getDpdpRequests,
  createDpdpRequest,
  updateDpdpRequest,
  getConsentLog,
  createConsentLog,
} from "../lib/api";
import { useRole } from "../hooks/useRole";

const ownerNames = {
  "user-admin": "Priya Sharma",
  "user-owner": "Arjun Mehta",
  "user-auditor": "Meera Iyer",
};

function DPDPPage() {
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const displayRequests = requests.filter((req) => {
    if (showCompleted) return true;
    return req.status !== "Completed";
  });

  // New Request Form
  const [reqForm, setReqForm] = useState({
    data_principal_name: "",
    request_type: "Access",
    received_on: new Date().toISOString().split("T")[0],
  });

  // New Consent Form
  const [consentForm, setConsentForm] = useState({
    data_principal_name: "",
    purpose: "",
    consent_status: "Given",
  });

  async function fetchData() {
    try {
      setLoading(true);
      if (activeTab === "requests") {
        const data = await getDpdpRequests();
        setRequests(data);
      } else {
        const data = await getConsentLog();
        setConsents(data);
      }
    } catch (err) {
      setError("Failed to fetch DPDP compliance logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDpdpRequest(reqForm);
      setRequestModalOpen(false);
      setReqForm({
        data_principal_name: "",
        request_type: "Access",
        received_on: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (err) {
      alert("Failed to log request: " + err.message);
    }
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    try {
      await createConsentLog(consentForm);
      setConsentModalOpen(false);
      setConsentForm({
        data_principal_name: "",
        purpose: "",
        consent_status: "Given",
      });
      fetchData();
    } catch (err) {
      alert("Failed to log consent: " + err.message);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    let payload = { status: newStatus };
    if (newStatus === "Rejected") {
      const reason = prompt("Please enter a legal or operational reason for rejecting this DPDP request:");
      if (reason === null) return; // user cancelled
      if (!reason.trim()) {
        alert("A rejection reason is explicitly required for compliance audit logs.");
        return;
      }
      payload.rejection_reason = reason.trim();
    }

    try {
      await updateDpdpRequest(requestId, payload);
      fetchData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleAssignmentChange = async (requestId, newAssignedTo) => {
    try {
      await updateDpdpRequest(requestId, { assigned_to: newAssignedTo });
      fetchData();
    } catch (err) {
      alert("Failed to assign request: " + err.message);
    }
  };

  const getDaysLeft = (slaDue) => {
    const due = new Date(slaDue);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">DPDP Module</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage data principal requests and privacy obligations under DPDP Act.
          </p>
        </div>
        {activeTab === "requests" ? (
          <button
            onClick={() => setRequestModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={16} />
            Log Request
          </button>
        ) : (
          <button
            onClick={() => setConsentModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={16} />
            Record Consent
          </button>
        )}
      </div>


      <div className="flex gap-4 border-b border-gray-800 pb-1">
        <button
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === "requests"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Data Principal Requests
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
            activeTab === "consent"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
          }`}
          onClick={() => setActiveTab("consent")}
        >
          Consent Ledger (Immutable)
        </button>
      </div>


      {activeTab === "requests" && (
        <div className="flex items-center justify-between bg-gray-900/30 p-4 rounded-xl border border-gray-800/60 backdrop-blur-sm">
          <div className="text-sm text-gray-400">
            Showing <span className="text-white font-medium">{displayRequests.length}</span> active requests
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
            <span className="text-xs font-medium text-gray-300 peer-checked:text-white">
              Show Completed Requests
            </span>
          </label>
        </div>
      )}


      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-center">
          {error}
        </div>
      ) : activeTab === "requests" ? (
        <Table columns={["Name", "Type", "Status", "Received On", "SLA Due", "Days Left", "Assigned To"]}>
          {displayRequests.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                No data principal requests recorded.
              </td>
            </tr>
          ) : (
            displayRequests.map((req) => {
              const daysLeft = getDaysLeft(req.sla_due);

              let rowColorClass = "border-t border-gray-800 hover:bg-gray-800/30 transition-colors";
              if (req.status !== "Completed") {
                if (daysLeft <= 5) {
                  rowColorClass = "border-t border-gray-800 bg-red-950/25 hover:bg-red-950/35 transition-colors";
                } else if (daysLeft <= 15) {
                  rowColorClass = "border-t border-gray-800 bg-yellow-950/20 hover:bg-yellow-950/30 transition-colors";
                } else {
                  rowColorClass = "border-t border-gray-800 bg-green-950/15 hover:bg-green-950/25 transition-colors";
                }
              }

              return (
                <tr key={req.id} className={rowColorClass}>
                  <td className="px-6 py-4 text-white font-medium">{req.data_principal_name}</td>
                  <td className="px-6 py-4 text-gray-300">{req.request_type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {role === "admin" ? (
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          className="bg-black border border-gray-800 text-gray-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-blue-500 w-fit"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        <Badge status={req.status} />
                      )}
                      {req.rejection_reason && (
                        <button
                          onClick={() => alert(`DPDP Rejection Reason:\n\n"${req.rejection_reason}"`)}
                          className="text-[10px] text-red-400 hover:text-red-300 max-w-[150px] truncate block text-left underline decoration-dotted cursor-pointer mt-0.5"
                          title="Click to view full rejection reason"
                        >
                          {req.rejection_reason}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{req.received_on}</td>
                  <td className="px-6 py-4 text-gray-300">{req.sla_due}</td>
                  <td className="px-6 py-4">
                    {req.status === "Completed" ? (
                      <span className="text-gray-500 font-medium">—</span>
                    ) : (
                      <span
                        className={`font-semibold ${
                          daysLeft <= 5
                            ? "text-red-400 animate-pulse"
                            : daysLeft <= 15
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {daysLeft} days
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {role === "admin" ? (
                      <select
                        value={req.assigned_to || ""}
                        onChange={(e) => handleAssignmentChange(req.id, e.target.value || null)}
                        className="bg-black border border-gray-800 text-gray-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Unassigned</option>
                        <option value="user-admin">Priya Sharma (Admin)</option>
                        <option value="user-owner">Arjun Mehta (Owner)</option>
                        {req.request_type !== "Erasure" && (
                          <option value="user-auditor">Meera Iyer (Auditor)</option>
                        )}
                      </select>
                    ) : (
                      ownerNames[req.assigned_to] || req.assigned_to || "Unassigned"
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      ) : (
        <Table columns={["Data Principal", "Purpose", "Consent Status", "Timestamp"]}>
          {consents.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                No consent logs recorded.
              </td>
            </tr>
          ) : (
            consents.map((log) => (
              <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{log.data_principal_name}</td>
                <td className="px-6 py-4 text-gray-300">{log.purpose}</td>
                <td className="px-6 py-4">
                  <Badge status={log.consent_status} />
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </Table>
      )}


      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Log DPDP Request">
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Data Principal Name</label>
            <input
              type="text"
              required
              value={reqForm.data_principal_name}
              onChange={(e) => setReqForm({ ...reqForm, data_principal_name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Rohit Kumar"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Request Type</label>
            <select
              value={reqForm.request_type}
              onChange={(e) => setReqForm({ ...reqForm, request_type: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
            >
              <option>Access</option>
              <option>Erasure</option>
              <option>Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Received On</label>
            <div className="relative">
              <input
                type="date"
                required
                value={reqForm.received_on}
                onChange={(e) => setReqForm({ ...reqForm, received_on: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>


      <Modal isOpen={consentModalOpen} onClose={() => setConsentModalOpen(false)} title="Record Customer Consent">
        <form onSubmit={handleConsentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Data Principal Name</label>
            <input
              type="text"
              required
              value={consentForm.data_principal_name}
              onChange={(e) =>
                setConsentForm({ ...consentForm, data_principal_name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Sneha Patel"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Purpose of Consent</label>
            <input
              type="text"
              required
              value={consentForm.purpose}
              onChange={(e) => setConsentForm({ ...consentForm, purpose: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Marketing Newsletter Emails"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Consent Status</label>
            <select
              value={consentForm.consent_status}
              onChange={(e) => setConsentForm({ ...consentForm, consent_status: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
            >
              <option value="Given">Given</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Log Consent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DPDPPage;