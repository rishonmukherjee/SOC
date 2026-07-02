import { useState } from "react";
import { Search, Filter } from "lucide-react";
import Table from "../components/Table";
import { activityLogs } from "../lib/mckdata";

function ActivityLogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");

  const columns = [
    "Timestamp",
    "User",
    "Action",
    "Module",
    "Details",
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      log.action.toLowerCase().includes(searchString) ||
      log.user.toLowerCase().includes(searchString) ||
      log.details.toLowerCase().includes(searchString);

    const matchesModule =
      moduleFilter === "All Modules" || log.module === moduleFilter;

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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
          Export Logs
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
            placeholder="Search activity..."
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
            <option>Risks</option>
            <option>Controls</option>
            <option>Evidence</option>
            <option>DPDP</option>
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <Table columns={columns}>
        {filteredLogs.map((log) => (
          <tr
            key={log.id}
            className="border-t border-gray-800 hover:bg-gray-800/20 transition-colors"
          >
            <td className="px-6 py-4 text-gray-300">
              {log.timestamp}
            </td>

            <td className="px-6 py-4 text-white">
              {log.user}
            </td>

            <td className="px-6 py-4 text-gray-300">
              {log.action}
            </td>

            <td className="px-6 py-4">
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
                {log.module}
              </span>
            </td>

            <td className="px-6 py-4 text-gray-400">
              {log.details}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default ActivityLogPage;