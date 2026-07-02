import { Outlet, Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useRole } from "../hooks/useRole";

function DashboardLayout() {
  const { isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
