import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const titles = {
    "/dashboard": "Dashboard",
    "/risks": "Risks",
    "/controls": "Controls",
    "/evidence": "Evidence",
    "/dpdp": "DPDP",
    "/activity": "Activity Log",
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-3 py-1.5 text-sm border border-gray-800 rounded-lg bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>
        <button className="text-gray-400 hover:text-white">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-700" />
      </div>
    </header>
  );
}

export default Header;
