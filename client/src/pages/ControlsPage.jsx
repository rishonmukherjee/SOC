import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import { controls } from "../lib/mckdata";

function ControlsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [criteriaFilter, setCriteriaFilter] = useState("All Criteria");

  const columns = [
    "Control",
    "Trust Criteria",
    "Status",
    "Owner",
    "Actions",
  ];

  const filteredControls = controls.filter((control) => {
    const matchesSearch = control.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCriteria =
      criteriaFilter === "All Criteria" || control.criteria === criteriaFilter;

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
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
          <Plus size={16} />
          Assign Control
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
          </select>

          <Filter
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>

      <Table columns={columns}>
        {filteredControls.map((control) => (
          <tr key={control.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
            <td className="px-6 py-4 text-white">{control.name}</td>

            <td className="px-6 py-4 text-gray-300">
              {control.criteria}
            </td>

            <td className="px-6 py-4">
              <Badge status={control.status} />
            </td>

            <td className="px-6 py-4 text-gray-300">
              {control.owner}
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

export default ControlsPage;