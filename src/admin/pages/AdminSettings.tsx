import { useState } from "react";
import { getSettings, saveSettings } from "@/lib/authStore";

const AdminSettings = () => {
  const initial = getSettings();
  const [adminEmail, setAdminEmail] = useState(initial.adminEmail);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ adminEmail, whatsapp, email, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-500 mt-1">Business info & admin access</p>
      </div>

      <form onSubmit={save} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-6 space-y-4">
        <Field label="Admin Email (this email gets admin role on login)" value={adminEmail} onChange={setAdminEmail} />
        <Field label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} />
        <Field label="Contact Email" value={email} onChange={setEmail} />
        <div>
          <label className="text-xs uppercase tracking-wider text-zinc-400">Business Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 px-5 py-2 rounded-md text-sm font-semibold hover:from-amber-300 hover:to-amber-500">
            Save Changes
          </button>
          {saved && <span className="text-sm text-emerald-400">Saved</span>}
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-xs uppercase tracking-wider text-zinc-400">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/60"
    />
  </div>
);

export default AdminSettings;
