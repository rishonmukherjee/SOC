import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import { evidence } from "../lib/mckdata";

function EvidencePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Evidence");

  const columns = [
    "Control",
    "Evidence",
    "Uploaded By",
    "Date",
    "Status",
    "Actions",
  ];

  const filteredEvidence = evidence.filter((item) => {
    const matchesSearch = item.control
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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
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
            placeholder="Search evidence..."
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

      <Table columns={columns}>
        {filteredEvidence.map((item) => (
          <tr key={item.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
            <td className="px-6 py-4 text-white">{item.control}</td>

            <td className="px-6 py-4 text-gray-300">
              {item.file}
            </td>

            <td className="px-6 py-4 text-gray-300">
              {item.uploadedBy}
            </td>

            <td className="px-6 py-4 text-gray-300">
              {item.date}
            </td>

            <td className="px-6 py-4">
              <Badge status={item.status} />
            </td>

            <td className="px-6 py-4">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default EvidencePage;