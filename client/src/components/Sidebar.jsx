import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  ScrollText,
  Activity,
  LogOut,
} from "lucide-react";
import { useRole } from "../hooks/useRole";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Risks", path: "/risks", icon: ShieldAlert },
  { name: "Controls", path: "/controls", icon: ShieldCheck },
  { name: "Evidence", path: "/evidence", icon: FileCheck2 },
  { name: "DPDP", path: "/dpdp", icon: ScrollText },
  { name: "Activity Logs", path: "/activity", icon: Activity },
];

function Sidebar() {
  const { user, logoutUser } = useRole();
  return (
    <aside className="w-64 bg-black text-gray-400 flex flex-col border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-lg font-bold text-white">Compliance</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-400 hover:bg-gray-900/60 hover:text-gray-200"
              }`
            }
          >
            <Icon size={18} />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* User profile and logout button */}
      <div className="px-4 py-4 border-t border-gray-800 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm uppercase">
            {user?.name?.[0] || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "Guest"}</p>
            <p className="text-xs text-gray-500 capitalize truncate">{user?.role || "Visitor"}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logoutUser();
            window.location.reload();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-red-950/30 text-gray-400 hover:text-red-400 border border-gray-800/80 hover:border-red-900/30 transition-all cursor-pointer"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
