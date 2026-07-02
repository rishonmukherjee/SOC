import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RisksPage from "./pages/RisksPage";
import ControlsPage from "./pages/ControlsPage";
import EvidencePage from "./pages/EvidencePage";
import DPDPPage from "./pages/DPDPPage";
import ActivityLogPage from "./pages/ActivityLogPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/dpdp" element={<DPDPPage />} />
        <Route path="/activity" element={<ActivityLogPage />} />
      </Route>
    </Routes>
  );
}

export default App;