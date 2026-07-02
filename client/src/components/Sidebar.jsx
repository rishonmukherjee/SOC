import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  ScrollText,
  Activity,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Risks", path: "/risks", icon: ShieldAlert },
  { name: "Controls", path: "/controls", icon: ShieldCheck },
  { name: "Evidence", path: "/evidence", icon: FileCheck2 },
  { name: "DPDP", path: "/dpdp", icon: ScrollText },
  { name: "Activity", path: "/activity", icon: Activity },
];

function Sidebar() {
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

      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}
export default Sidebar;
