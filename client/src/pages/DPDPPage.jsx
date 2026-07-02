import { useState } from "react";
import { Plus } from "lucide-react";
import Table from "../components/Table";
import Badge from "../components/Badge";
import { dpdpRequests, consentLog } from "../lib/mckdata";

function DPDPPage() {
  const [activeTab, setActiveTab] = useState("requests");

  const requestsColumns = [
    "Name",
    "Type",
    "Status",
    "Received On",
    "SLA Due",
    "Days Left",
    "Assigned To",
    "Actions",
  ];

  const consentColumns = [
    "Data Principal",
    "Purpose",
    "Consent Status",
    "Timestamp",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">DPDP Module</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage data principal requests and privacy obligations.
          </p>
        </div>
        {activeTab === "requests" && (
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <Plus size={16} />
            Log Request
          </button>
        )}
      </div>

      {/* Tabs */}
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
          Consent Log
        </button>
      </div>

      {/* Content */}
      {activeTab === "requests" ? (
        <Table columns={requestsColumns}>
          {dpdpRequests.map((req) => (
            <tr key={req.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 text-white">{req.name}</td>
              <td className="px-6 py-4 text-gray-300">{req.type}</td>
              <td className="px-6 py-4">
                <Badge status={req.status} />
              </td>
              <td className="px-6 py-4 text-gray-300">{req.receivedOn}</td>
              <td className="px-6 py-4 text-gray-300">{req.slaDue}</td>
              <td className="px-6 py-4">
                <span className="font-semibold text-white">{req.daysLeft}</span>
              </td>
              <td className="px-6 py-4 text-gray-300">{req.assignedTo}</td>
              <td className="px-6 py-4">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View
                </button>
              </td>
            </tr>
          ))}
        </Table>
      ) : (
        <Table columns={consentColumns}>
          {consentLog.map((log) => (
            <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 text-white">{log.name}</td>
              <td className="px-6 py-4 text-gray-300">{log.purpose}</td>
              <td className="px-6 py-4">
                <Badge status={log.status} />
              </td>
              <td className="px-6 py-4 text-gray-300">{log.timestamp}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

export default DPDPPage;