import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  ScrollText,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { getDashboardSummary, getActivityLogs } from "../lib/api";

function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, logsData] = await Promise.all([
          getDashboardSummary(),
          getActivityLogs(),
        ]);
        setSummary(summaryData);
        setLogs(logsData);
      } catch (err) {
        setError("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-center">
        {error}
      </div>
    );
  }

  // Calculate open risks count
  const openRisksCount = Object.values(summary?.openRisksBySeverity || {}).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-gray-400 mt-2">
            Welcome back! Here's your organization's compliance posture.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/risks")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Risk
          </button>
          <button
            onClick={() => navigate("/evidence")}
            className="border border-gray-700 hover:border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
          >
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Open Risks"
          value={openRisksCount.toString()}
          change="Live risks needing attention"
          color="red"
          icon={ShieldAlert}
        />
        <StatCard
          title="Controls Implemented"
          value={summary?.controlsByStatus?.["Implemented"]?.toString() || "0"}
          change={`Out of ${summary?.controlsTotal || 0} total`}
          color="green"
          icon={ShieldCheck}
        />
        <StatCard
          title="Pending Evidence"
          value={summary?.evidencePendingCount?.toString() || "0"}
          change="Awaiting auditor review"
          color="yellow"
          icon={FileCheck2}
        />
        <StatCard
          title="Open DPDP Requests"
          value={summary?.dpdpRequestsDueSoon?.length?.toString() || "0"}
          change="Requests requiring actions"
          color="blue"
          icon={ScrollText}
        />
      </div>

      {/* Recent Activity + SLA Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming SLA Deadlines */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">
              Upcoming SLA Deadlines (30 Days)
            </h3>
            <button
              onClick={() => navigate("/dpdp")}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {summary?.dpdpRequestsDueSoon?.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No active SLA deadlines</p>
            ) : (
              summary?.dpdpRequestsDueSoon
                ?.sort((a, b) => a.daysLeft - b.daysLeft)
                ?.slice(0, 4)
                ?.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-none"
                  >
                    <div>
                      <p className="text-white font-medium">{request.data_principal_name}</p>
                      <p className="text-sm text-gray-400">{request.request_type} Request</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          request.daysLeft <= 5
                            ? "text-red-400"
                            : request.daysLeft <= 15
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {request.daysLeft} days
                      </p>
                      <p className="text-xs text-gray-500">Remaining</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <button
              onClick={() => navigate("/activity")}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No recent compliance events</p>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b border-gray-800 pb-4 last:border-none"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{log.action}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      By {log.actor_name || "System"} ({log.actor_id || "system"})
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Compliance Summary
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Overall security and compliance posture.
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-green-400">
              {summary?.controlsImplementedPct || 0}%
            </p>
            <p className="text-sm text-gray-500">Overall Compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Controls Total</p>
            <h4 className="text-white text-2xl font-semibold mt-2">
              {summary?.controlsTotal || 0}
            </h4>
            <p className="text-blue-400 text-sm mt-1">Tracked Frameworks</p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Risks Severity</p>
            <h4 className="text-white text-2xl font-semibold mt-2">
              {openRisksCount}
            </h4>
            <p className="text-red-400 text-sm mt-1">
              {summary?.openRisksBySeverity?.Critical || 0} Critical / {summary?.openRisksBySeverity?.High || 0} High
            </p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Evidence Review</p>
            <h4 className="text-white text-2xl font-semibold mt-2">
              {summary?.evidencePendingCount || 0}
            </h4>
            <p className="text-yellow-400 text-sm mt-1">Pending approval</p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">SLA Breaches</p>
            <h4 className="text-white text-2xl font-semibold mt-2">
              {summary?.dpdpRequestsDueSoon?.filter((r) => r.daysLeft <= 5).length || 0}
            </h4>
            <p className="text-orange-400 text-sm mt-1">Urgent Requests (&lt;5 days)</p>
          </div>
        </div>

        <div className={`mt-6 flex items-center justify-between rounded-lg border px-5 py-4 ${
          (summary?.controlsImplementedPct || 0) >= 80
            ? "border-green-500/20 bg-green-500/10"
            : "border-yellow-500/20 bg-yellow-500/10"
        }`}>
          <div>
            <h4 className={`font-semibold ${
              (summary?.controlsImplementedPct || 0) >= 80 ? "text-green-400" : "text-yellow-400"
            }`}>
              Audit Readiness
            </h4>
            <p className="text-gray-400 text-sm mt-1">
              {(summary?.controlsImplementedPct || 0) >= 80
                ? "Your organization is currently ready for an audit."
                : "Remediation recommended: Implement more controls to reach audit readiness target (80%)."}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              (summary?.controlsImplementedPct || 0) >= 80
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {(summary?.controlsImplementedPct || 0) >= 80 ? "Ready" : "In Progress"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
