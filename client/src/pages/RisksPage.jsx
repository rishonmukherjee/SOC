import { useState, useEffect } from "react";
import { Search, Plus, Filter } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import CreateRiskForm from "../components/Createrisk";
import { getRisks, createRisk } from "../lib/api";

const InfoTooltip = ({ text }) => {
  return (
    <span className="relative group inline-block ml-1.5 cursor-help align-middle">
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-700 hover:border-gray-500 text-[10px] text-gray-500 hover:text-gray-300 transition-colors select-none font-sans font-normal">
        i
      </span>
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-150 origin-top bg-gray-950 border border-gray-800 text-gray-300 text-[11px] leading-normal p-2.5 rounded-lg shadow-xl z-50 text-center font-normal normal-case">
        {text}
      </span>
    </span>
  );
};

function RisksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columns = [
    "Risk",
    <span className="flex items-center" key="likelihood">
      Likelihood
      <InfoTooltip text="Probability of the risk event occurring, from 1 (Rare) to 5 (Almost Certain)." />
    </span>,
    <span className="flex items-center" key="impact">
      Impact
      <InfoTooltip text="Potential damage to compliance or security if the event occurs, from 1 (Negligible) to 5 (Critical)." />
    </span>,
    <span className="flex items-center" key="score">
      Score
      <InfoTooltip text="Risk Rating (Likelihood × Impact). Critical: 20-25, Medium: 8-14, Low: 1-7." />
    </span>,
    "Status",
  ];

  async function fetchRisks() {
    try {
      setLoading(true);
      const data = await getRisks();
      setRisks(data);
    } catch (err) {
      setError("Failed to load risks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleCreateRisk = async (newRiskData) => {
    try {
      await createRisk(newRiskData);
      setModalOpen(false);
      fetchRisks(); // Refresh the list
    } catch (err) {
      alert("Failed to create risk: " + err.message);
    }
  };

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

      {/* Loading state */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-center">
          {error}
        </div>
      ) : (
        /* Table */
        <Table columns={columns}>
          {filteredRisks.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-sm">
                No risks found matching criteria.
              </td>
            </tr>
          ) : (
            filteredRisks.map((risk) => (
              <tr
                key={risk.id}
                className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-6 py-4 text-white font-medium">{risk.title}</td>
                <td className="px-6 py-4 text-gray-300">{risk.likelihood}</td>
                <td className="px-6 py-4 text-gray-300">{risk.impact}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-white">{risk.score}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge status={risk.status} />
                </td>
              </tr>
            ))
          )}
        </Table>
      )}

      {/* Create Risk Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Risk"
      >
        <CreateRiskForm
          onSubmit={handleCreateRisk}
        />
      </Modal>
    </div>
  );
}

export default RisksPage;