import { useState } from "react";
import {
  LayoutDashboard,ShieldAlert,ShieldCheck,FileCheck2,ScrollText,Activity,Bell,Search,
} from "lucide-react";

const nav = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Risks", icon: ShieldAlert },
  { name: "Controls", icon: ShieldCheck },
  { name: "Evidence", icon: FileCheck2 },
  { name: "DPDP", icon: ScrollText },
  { name: "Activity", icon: Activity },
];

function App() {
  const [active, setActive] = useState("Dashboard");
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Side */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-lg font-semibold text-white">
            TEST TEST TEST  
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ name, icon: Icon }) => {
            const isActive = active === name;
            return (
              <button
                key={name}
                onClick={() => setActive(name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <Icon size={18} />
                {name}
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
          v1.0.0
        </div>
      </aside>
      {/* Right */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">
            {active}
          </h1>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            {/* Notif Button */}
            <button className="text-gray-500 hover:text-gray-700">
              <Bell size={18} />
            </button>
            {/* User */}
           <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">
  CM
</div>
          </div>
        </header>
        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[60vh] flex items-center justify-center text-gray-400 text-xl">
            {active} content goes here
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;