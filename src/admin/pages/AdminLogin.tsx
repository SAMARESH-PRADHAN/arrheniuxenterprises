import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (r.ok) navigate("/admin");
    else setError(r.error || "Login failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.05),transparent_50%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <div className="flex items-center gap-3 pb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Admin Access</h1>
            <p className="text-xs text-zinc-500">Restricted area</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-semibold py-2.5 rounded-md transition shadow-lg shadow-amber-500/20"
        >
          Enter Console
        </button>
        <p className="text-xs text-zinc-600 text-center">
          Default: admin@arrhenius.com / admin123
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
