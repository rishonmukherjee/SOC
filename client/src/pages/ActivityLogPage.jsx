import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Table from "../components/Table";
import { getActivityLogs } from "../lib/api";

function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = [
    "Timestamp",
    "User",
    "Action",
    "Module",
    "ID",
  ];

  async function fetchLogs() {
    try {
      setLoading(true);
      const data = await getActivityLogs();
      setLogs(data);
    } catch (err) {
      setError("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchString = searchTerm.toLowerCase();
    const actorName = log.actor_name || "";
    const actionText = log.action || "";
    const entityId = log.entity_id || "";

    const matchesSearch =
      actionText.toLowerCase().includes(searchString) ||
      actorName.toLowerCase().includes(searchString) ||
      entityId.toLowerCase().includes(searchString);

    const matchesModule =
      moduleFilter === "All Modules" ||
      (moduleFilter === "DPDP" &&
        (log.entity_type.toLowerCase().includes("dpdp") ||
         log.entity_type.toLowerCase().includes("consent"))) ||
      log.entity_type.toLowerCase() === moduleFilter.toLowerCase();

    return matchesSearch && matchesModule;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Activity Log</h2>
          <p className="text-sm text-gray-400 mt-1">
            Track all compliance-related actions across the platform.
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
            placeholder="Search activity by user, action, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-inner"
          />
        </div>

        <div className="relative">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-black/50 border border-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm transition-all appearance-none hover:border-gray-700 min-w-[170px]"
          >
            <option>All Modules</option>
            <option value="Risk">Risks</option>
            <option value="Control">Controls</option>
            <option value="Evidence">Evidence</option>
            <option value="DPDP">DPDP</option>
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
          {filteredLogs.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">
                No activity logs found.
              </td>
            </tr>
          ) : (
            filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-t border-gray-800 hover:bg-gray-800/20 transition-colors"
              >
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-white font-medium">
                  {log.actor_name || "System"} ({log.actor_id || "system"})
                </td>

                <td className="px-6 py-4 text-gray-300">
                  {log.action}
                </td>

                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-gray-900 text-blue-400 border border-blue-900/30 text-xs">
                    {log.entity_type}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                  {log.entity_id}
                </td>
              </tr>
            ))
          )}
        </Table>
      )}
    </div>
  );
}

export default ActivityLogPage;