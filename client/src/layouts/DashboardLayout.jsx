import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
