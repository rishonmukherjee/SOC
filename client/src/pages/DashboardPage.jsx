import {
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  ScrollText,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { activityLogs, dpdpRequests } from "../lib/mckdata";

function DashboardPage() {
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
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + New Risk
          </button>
          <button className="border border-gray-700 hover:border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm transition">
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Open Risks"
          value="12"
          change="+2 New"
          color="red"
          icon={ShieldAlert}
        />
        <StatCard
          title="Controls Implemented"
          value="38"
          change="+5 Completed"
          color="green"
          icon={ShieldCheck}
        />
        <StatCard
          title="Pending Evidence"
          value="9"
          change="-3 Reviewed"
          color="yellow"
          icon={FileCheck2}
        />
        <StatCard
          title="Open DPDP Requests"
          value="4"
          change="+1 Today"
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
              Upcoming SLA Deadlines
            </h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {dpdpRequests
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .slice(0, 4)
              .map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-none"
                >
                  <div>
                    <p className="text-white font-medium">{request.name}</p>
                    <p className="text-sm text-gray-400">{request.type} Request</p>
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
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between border-b border-gray-800 pb-4 last:border-none"
              >
                <div>
                  <p className="text-white text-sm font-medium">{log.action}</p>
                  <p className="text-gray-400 text-xs mt-1">{log.user}</p>
                </div>
                <span className="text-xs text-gray-500">{log.timestamp}</span>
              </div>
            ))}
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
            <p className="text-5xl font-bold text-green-400">82%</p>
            <p className="text-sm text-gray-500">Overall Compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Controls</p>
            <h4 className="text-white text-2xl font-semibold mt-2">38</h4>
            <p className="text-green-400 text-sm mt-1">Implemented</p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Risks</p>
            <h4 className="text-white text-2xl font-semibold mt-2">12</h4>
            <p className="text-red-400 text-sm mt-1">Open</p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">Evidence</p>
            <h4 className="text-white text-2xl font-semibold mt-2">9</h4>
            <p className="text-yellow-400 text-sm mt-1">Pending Review</p>
          </div>
          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <p className="text-gray-500 text-xs uppercase">DPDP</p>
            <h4 className="text-white text-2xl font-semibold mt-2">4</h4>
            <p className="text-blue-400 text-sm mt-1">Active Requests</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/10 px-5 py-4">
          <div>
            <h4 className="text-green-400 font-semibold">Audit Readiness</h4>
            <p className="text-gray-400 text-sm mt-1">
              Your organization is currently ready for an internal audit.
            </p>
          </div>
          <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
            Ready
          </span>
        </div>
      </div>

    </div>
  );
}

export default DashboardPage;
