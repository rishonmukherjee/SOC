import { useState } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  ScrollText,
  Activity,
  Bell,
  Search,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Risks', icon: ShieldAlert },
  { name: 'Controls', icon: ShieldCheck },
  { name: 'Evidence', icon: FileCheck2 },
  { name: 'DPDP', icon: ScrollText },
  { name: 'Activity', icon: Activity },
];

function App() {
  const [active, setActive] = useState('Dashboard');

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-gray-400 flex flex-col border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-lg font-bold text-white">Compliance</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ name, icon: Icon }) => {
            const isActive = active === name;
            return (
              <button
                key={name}
                onClick={() => setActive(name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-900/60 hover:text-gray-200'
                  }`}
              >
                <Icon size={18} />
                {name}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
          v1.0.0
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-white">{active}</h1>

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

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-black">
          <div className="bg-black rounded-xl border border-gray-500 p-6 min-h-[60vh] flex items-center justify-center text-gray-500">
            {active} content goes here
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;