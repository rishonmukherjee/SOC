import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import CreateRiskForm from "../components/Createrisk";
import { risks } from "../lib/mckdata";

function RisksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    "Risk",
    "Likelihood",
    "Impact",
    "Score",
    "Status",
    "Actions",
  ];

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch = risk.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || risk.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Risks</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage and monitor any compliance risks.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Plus size={16} />
          Create Risk
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
            placeholder="Search risks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-inner"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm transition-all appearance-none hover:border-gray-700 min-w-[140px]"
          >
            <option>All</option>
            <option>Open</option>
            <option>Mitigated</option>
            <option>Accepted</option>
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <Table columns={columns}>
        {filteredRisks.map((risk) => (
          <tr
            key={risk.id}
            className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
          >
            <td className="px-6 py-4 text-white">{risk.title}</td>

            <td className="px-6 py-4 text-gray-300">{risk.likelihood}</td>

            <td className="px-6 py-4 text-gray-300">{risk.impact}</td>

            <td className="px-6 py-4">
              <span className="font-semibold text-white">{risk.score}</span>
            </td>

            <td className="px-6 py-4">
              <Badge status={risk.status} />
            </td>

            <td className="px-6 py-4">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Edit
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Create Risk Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Risk"
      >
        <CreateRiskForm
          onSubmit={(risk) => {
            console.log("New risk:", risk);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

export default RisksPage;