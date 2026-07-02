import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  const titles = {
    "/dashboard": "Dashboard",
    "/risks": "Risks",
    "/controls": "Controls",
    "/evidence": "Evidence",
    "/dpdp": "DPDP",
    "/activity": "Activity Logs",
  };

  const pageTitle = titles[location.pathname] || "Dashboard";

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
    </header>
  );
}

export default Header;
