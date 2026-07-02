import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import { getControls, updateControl } from "../lib/api";
import { useRole } from "../hooks/useRole";

const ownerNames = {
  "user-admin": "Priya Sharma",
  "user-owner": "Arjun Mehta",
  "user-auditor": "Meera Iyer",
};

function ControlsPage() {
  const { role } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [criteriaFilter, setCriteriaFilter] = useState("All Criteria");
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = [
    "Control",
    "Trust Criteria",
    "Status",
    "Owner",
  ];

  async function fetchControls() {
    try {
      setLoading(true);
      const data = await getControls();
      setControls(data);
    } catch (err) {
      setError("Failed to load controls");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchControls();
  }, []);

  const handleStatusChange = async (controlId, newStatus) => {
    try {
      await updateControl(controlId, { status: newStatus });
      fetchControls(); // Refresh
    } catch (err) {
      alert("Failed to update control status: " + err.message);
    }
  };

  const handleOwnerChange = async (controlId, newOwnerId) => {
    try {
      await updateControl(controlId, { owner_id: newOwnerId });
      fetchControls(); // Refresh
    } catch (err) {
      alert("Failed to assign control: " + err.message);
    }
  };

  const filteredControls = controls.filter((control) => {
    const matchesSearch = control.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCriteria =
      criteriaFilter === "All Criteria" ||
      control.trust_criteria === criteriaFilter;

    return matchesSearch && matchesCriteria;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Controls</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage SOC 2 controls and their implementation status.
          </p>
        </div>
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
            placeholder="Search controls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-inner"
          />
        </div>

        <div className="relative">
          <select
            value={criteriaFilter}
            onChange={(e) => setCriteriaFilter(e.target.value)}
            className="bg-black/50 border border-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm transition-all appearance-none hover:border-gray-700 min-w-[170px]"
          >
            <option>All Criteria</option>
            <option>Security</option>
            <option>Availability</option>
            <option>Confidentiality</option>
            <option>Processing Integrity</option>
            <option>Privacy</option>
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
        <Table columns={columns}>
          {filteredControls.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">
                No controls found matching criteria.
              </td>
            </tr>
          ) : (
            filteredControls.map((control) => (
              <tr key={control.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 text-white">
                  <div className="font-medium">{control.name}</div>
                  {control.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{control.description}</div>
                  )}
                </td>

                <td className="px-6 py-4 text-gray-300">
                  {control.trust_criteria}
                </td>

                <td className="px-6 py-4">
                  {/* Allow Owners and Admins to toggle status directly */}
                  {role === "admin" || role === "owner" ? (
                    <select
                      value={control.status}
                      onChange={(e) => handleStatusChange(control.id, e.target.value)}
                      className="bg-black border border-gray-800 text-gray-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Implemented">Implemented</option>
                    </select>
                  ) : (
                    <Badge status={control.status} />
                  )}
                </td>

                <td className="px-6 py-4 text-gray-300 text-sm">
                  {/* Allow Admin to re-assign owners */}
                  {role === "admin" ? (
                    <select
                      value={control.owner_id}
                      onChange={(e) => handleOwnerChange(control.id, e.target.value)}
                      className="bg-black border border-gray-800 text-gray-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="user-admin">Priya Sharma (Admin)</option>
                      <option value="user-owner">Arjun Mehta (Owner)</option>
                      <option value="user-auditor">Meera Iyer (Auditor)</option>
                    </select>
                  ) : (
                    ownerNames[control.owner_id] || control.owner_id
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      )}
    </div>
  );
}

export default ControlsPage;