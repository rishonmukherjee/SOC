import { useState, useEffect } from "react";
import { Search, Plus, Filter, Check, X, Download } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { getEvidence, getControls, uploadEvidence, reviewEvidence } from "../lib/api";
import { useRole } from "../hooks/useRole";

const ownerNames = {
  "user-admin": "Priya Sharma",
  "user-owner": "Arjun Mehta",
  "user-auditor": "Meera Iyer",
};

function EvidencePage() {
  const { role } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Evidence");
  const [evidenceList, setEvidenceList] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedControl, setSelectedControl] = useState("");
  const [uploadType, setUploadType] = useState("file"); // "file" or "text"
  const [file, setFile] = useState(null);
  const [textLink, setTextLink] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      const [evidenceData, controlsData] = await Promise.all([
        getEvidence(),
        getControls(),
      ]);
      setEvidenceList(evidenceData);
      setControls(controlsData);
      if (controlsData.length > 0) {
        setSelectedControl(controlsData[0].id);
      }
    } catch (err) {
      setError("Failed to load evidence repository");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (uploadType === "file" && !file) {
      alert("Please select a file to upload");
      return;
    }
    if (uploadType === "text" && !textLink) {
      alert("Please input a link or documentation text");
      return;
    }

    try {
      await uploadEvidence(
        selectedControl,
        uploadType === "file" ? file : null,
        uploadType === "text" ? textLink : ""
      );
      setModalOpen(false);
      setFile(null);
      setTextLink("");
      fetchData();
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const handleReview = async (evidenceId, status) => {
    let reason = null;
    if (status === "Rejected" || status === "Needs Resubmission") {
      reason = prompt("Please enter the reason for rejection:");
      if (reason === null) return; // User cancelled
      if (!reason.trim()) {
        alert("A rejection reason is required.");
        return;
      }
    }
    try {
      await reviewEvidence(evidenceId, status, reason);
      fetchData();
    } catch (err) {
      alert("Review action failed: " + err.message);
    }
  };

  const filteredEvidence = evidenceList.filter((item) => {
    // Map control ID to name for searching
    const controlObj = controls.find((c) => c.id === item.control_id);
    const controlName = controlObj ? controlObj.name : item.control_id;

    const matchesSearch = controlName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Evidence" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Evidence Repository</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage and review audit evidence linked to SOC 2 controls.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Plus size={16} />
          Upload Evidence
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900/30 p-4 rounded-xl border border-gray-800/60 backdrop-blur-sm">
        <div className="relative group flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search evidence by control..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-inner"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm transition-all appearance-none hover:border-gray-700 min-w-[170px]"
          >
            <option>All Evidence</option>
            <option>Pending Review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>

          <Filter
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-center">
          {error}
        </div>
      ) : (
        <Table columns={["Control", "Evidence / Link", "Uploaded By", "Date", "Status", "Actions"]}>
          {filteredEvidence.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                No evidence items found.
              </td>
            </tr>
          ) : (
            filteredEvidence.map((item) => {
              const controlObj = controls.find((c) => c.id === item.control_id);
              const controlName = controlObj ? controlObj.name : item.control_id;

              return (
                <tr key={item.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{controlName}</td>

                  <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                    {item.file_url_or_text?.startsWith("uploads/") ? (
                      <a
                        href={`/api/${item.file_url_or_text}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-400 hover:underline"
                      >
                        <Download size={14} />
                        {item.file_url_or_text.replace("uploads/", "")}
                      </a>
                    ) : (
                      item.file_url_or_text
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {ownerNames[item.uploaded_by] || item.uploaded_by || "System"}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge status={item.status} />
                      {item.rejection_reason && (
                        <span className="text-[10px] text-red-400 max-w-[150px] truncate block" title={item.rejection_reason}>
                          {item.rejection_reason}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {/* Role-based actions for auditors */}
                    {role === "auditor" && item.status === "Pending Review" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(item.id, "Approved")}
                          className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
                          title="Approve Evidence"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReview(item.id, "Rejected")}
                          className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                          title="Reject Evidence"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">No actions available</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      )}

      {/* Upload Evidence Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Evidence">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Control</label>
            <select
              value={selectedControl}
              onChange={(e) => setSelectedControl(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white"
            >
              {controls.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.trust_criteria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Evidence Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="uploadType"
                  value="file"
                  checked={uploadType === "file"}
                  onChange={() => setUploadType("file")}
                  className="accent-blue-500"
                />
                File Upload
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="uploadType"
                  value="text"
                  checked={uploadType === "text"}
                  onChange={() => setUploadType("text")}
                  className="accent-blue-500"
                />
                Link or Text Documentation
              </label>
            </div>
          </div>

          {uploadType === "file" ? (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Choose File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Link or Description Text</label>
              <textarea
                value={textLink}
                onChange={(e) => setTextLink(e.target.value)}
                rows={4}
                placeholder="Paste S3 bucket URL, database config details, or policy text here..."
                className="w-full rounded-lg border border-gray-700 bg-black/30 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Submit Evidence
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EvidencePage;