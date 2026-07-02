import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRole } from "../hooks/useRole";
import { login } from "../lib/api";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const personas = [
    {
      role: "admin",
      name: "Priya Sharma",
      title: "COMPLIANCE ADMINISTRATOR",
      description: "Manage control mappings, configure risks, and define policies.",
      border: "hover:border-zinc-700",
      renderIllustration: () => (
        <div className="h-32 w-full bg-black/60 border border-zinc-800/80 rounded-xl flex items-center justify-center p-4 mb-6 font-mono text-[10px]">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between border border-zinc-800/80 bg-zinc-950/80 p-2 rounded-lg">
              <span className="text-zinc-500">SOC 2 CC6.1</span>
              <span className="text-zinc-700">→</span>
              <span className="text-blue-400 font-semibold bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30">MFA Policy</span>
            </div>
            <div className="flex items-center justify-between border border-zinc-800/80 bg-zinc-950/80 p-2 rounded-lg">
              <span className="text-zinc-500">SOC 2 CC6.3</span>
              <span className="text-zinc-700">→</span>
              <span className="text-[#00a389] font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">Encryption</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      role: "owner",
      name: "Arjun Mehta",
      title: "CONTROL OWNER",
      description: "Upload audit evidence, track remediation tasks, and update progress.",
      border: "hover:border-zinc-700",
      renderIllustration: () => (
        <div className="h-32 w-full bg-black/60 border border-zinc-800/80 rounded-xl flex flex-col justify-center p-4 mb-6 font-mono text-[10px]">
          <div className="border border-zinc-800/80 bg-zinc-950/80 p-2.5 rounded-lg w-full">
            <div className="flex justify-between text-zinc-400 mb-1">
              <span className="truncate text-zinc-400">mfa_logs_q2.csv</span>
              <span className="text-[#00a389] font-semibold">100%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00a389] h-full w-full"></div>
            </div>
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-zinc-900">
              <span className="text-zinc-600">Size: 42 KB</span>
              <span className="text-[#ff6b00] font-semibold bg-[#ff6b00]/10 px-1.5 py-0.5 rounded border border-[#ff6b00]/20">Pending Review</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      role: "auditor",
      name: "Meera Iyer",
      title: "INTERNAL/EXTERNAL AUDITOR",
      description: "Review uploaded evidence, verify controls, and sign off on readiness.",
      border: "hover:border-zinc-700",
      renderIllustration: () => (
        <div className="h-32 w-full bg-black/60 border border-zinc-800/80 rounded-xl flex flex-col justify-center p-4 mb-6 font-mono text-[10px]">
          <div className="border border-zinc-800/80 bg-zinc-950/80 p-2.5 rounded-lg w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse"></div>
              <span className="text-zinc-500 font-semibold">Verification Request</span>
            </div>
            <p className="text-zinc-500 text-[9px] mb-3 leading-relaxed truncate">
              Q2 database backup restoration checks
            </p>
            <div className="flex gap-2">
              <div className="flex-1 py-1 rounded bg-emerald-950/20 text-[#00a389] border border-emerald-900/30 text-center font-medium text-[9px]">
                Approve
              </div>
              <div className="flex-1 py-1 rounded bg-red-950/20 text-red-400 border border-red-900/30 text-center font-medium text-[9px]">
                Reject
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleLogin = async (role) => {
    setLoading(true);
    setError("");
    try {
      const userData = await login(role);
      loginUser(userData);
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="text-center text-3xl font-bold text-white tracking-tight">
          ComplianceOS
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Select a role profile to access the audit dashboard
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-5xl px-4 sm:px-0 z-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => {
            return (
              <button
                key={persona.role}
                onClick={() => !loading && handleLogin(persona.role)}
                disabled={loading}
                className={`group text-left flex flex-col justify-between p-7 rounded-2xl border border-zinc-800/80 bg-[#0c0d12] transition-all duration-200 ${persona.border} cursor-pointer`}
              >
                <div>
                  {persona.renderIllustration()}
                  
                  <h3 className="text-lg font-bold text-white">
                    {persona.name}
                  </h3>
                  <p className="text-xs text-blue-500 font-semibold tracking-wider mt-1">
                    {persona.title}
                  </p>
                  <p className="text-sm text-zinc-400 mt-4 leading-relaxed font-light">
                    {persona.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center text-xs font-semibold text-zinc-500 group-hover:text-white transition-colors">
                  <span>Sign In</span>
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;