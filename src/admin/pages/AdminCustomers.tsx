import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getUsers } from "@/lib/authStore";

const AdminCustomers = () => {
  const [q, setQ] = useState("");
  const customers = useMemo(() => getUsers().filter((u) => u.role === "customer"), []);
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Customers</h1>
          <p className="text-zinc-500 mt-1">{customers.length} registered customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60 w-64"
          />
        </div>
      </div>

      <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Name</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Email</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Phone</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Company</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Provider</th>
              <th className="text-left px-4 py-3 font-medium uppercase text-xs tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No customers yet</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-medium text-zinc-100">{c.name}</td>
                <td className="px-4 py-3 text-zinc-300">{c.email}</td>
                <td className="px-4 py-3 text-zinc-400">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{c.company || "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 capitalize">{c.provider}</span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
