import { useLocation } from "react-router-dom";
import { useRole } from "../hooks/useRole";

function Header() {
  const location = useLocation();
  const { user, loginUser } = useRole();

  const titles = {
    "/dashboard": "Dashboard",
    "/risks": "Risks",
    "/controls": "Controls",
    "/evidence": "Evidence",
    "/dpdp": "DPDP",
    "/activity": "Activity Logs",
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  const handleRoleSwitch = (newRole) => {
    const roles = {
      admin: { userId: "user-admin", name: "Priya Sharma", role: "admin" },
      owner: { userId: "user-owner", name: "Arjun Mehta", role: "owner" },
      auditor: { userId: "user-auditor", name: "Meera Iyer", role: "auditor" },
    };
    loginUser(roles[newRole]);
    window.location.reload();
  };

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
      
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider hidden sm:inline-block">Demo Role:</span>
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleRoleSwitch("admin")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              user?.role === "admin"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleSwitch("owner")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              user?.role === "owner"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => handleRoleSwitch("auditor")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              user?.role === "auditor"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Auditor
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
