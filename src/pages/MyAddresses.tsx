import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Plus, Trash2, Star, Edit2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Layout } from "@/components/Layout";
import {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from "@/lib/authStore";
import { getSession } from "@/lib/session";
import { toast } from "@/hooks/use-toast";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const empty = () => ({
  name: "",
  line1: "",
  line2: "",
  landmark: "",
  mobile: "",
  altMobile: "",
  city: "",
  state: "",
  pincode: "",
});

const MyAddresses = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const [user, setUser] = useState(getSession());
  const [list, setList] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(empty());
  useLockBodyScroll(showForm);   // ← add this line

  useEffect(() => {
    const u = getSession();
    if (!u) { navigate(`/auth?next=${encodeURIComponent(next ? `/my-addresses?next=${encodeURIComponent(next)}` : "/my-addresses")}`); return; }
    setUser(u);
    const addrs = getAddresses(u.id);
    setList(addrs);
    // If arriving here to complete checkout and an address already exists, bounce straight back.
    if (next && addrs.length > 0) {
      navigate(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const refresh = () => user && setList(getAddresses(user.id));

  const openNew = () => { setEditing(null); setDraft(empty()); setShowForm(true); };
  const openEdit = (a: Address) => {
    setEditing(a);
    setDraft({
      name: a.name, line1: a.line1, line2: a.line2 || "", landmark: a.landmark || "",
      mobile: a.mobile, altMobile: a.altMobile || "", city: a.city, state: a.state, pincode: a.pincode,
    });
    setShowForm(true);
  };

  const submit = () => {
    if (!user) return;
    const req = ["name", "line1", "mobile", "city", "state", "pincode"] as const;
    for (const k of req) if (!draft[k].trim()) { toast({ title: "Missing field", description: `Please fill ${k}.` }); return; }
    const wasEmpty = list.length === 0;
    if (editing) updateAddress(editing.id, draft);
    else saveAddress({ ...draft, userId: user.id });
    toast({ title: editing ? "Address updated" : "Address added" });
    setShowForm(false);
    refresh();

    // First address just saved while coming from checkout — send them back to finish the order.
    if (next && wasEmpty && !editing) {
     navigate(next || "/my-addresses");
    }
  };

  const remove = (id: string) => { deleteAddress(id); refresh(); toast({ title: "Address removed" }); };
  const makeDefault = (id: string) => { if (user) { setDefaultAddress(user.id, id); refresh(); } };

  const finishCheckout = () => {
    if (next) navigate(next);
  };

  return createPortal(
    <Layout>
      <section className="container-x py-10 min-h-[70vh] animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Profile</span>
            <h1 className="font-display text-4xl md:text-5xl mt-1">MY ADDRESSES</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {next
                ? "Save a delivery address to continue with your order — you won't need to re-enter it next time."
                : "Manage your delivery addresses."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/my-orders" className="text-xs uppercase tracking-widest border border-border px-3 py-2 hover:border-ink transition">My Orders</Link>
            <button onClick={openNew} className="btn-bold text-sm !py-2.5"><Plus className="h-4 w-4" /> Add Address</button>
          </div>
        </div>

        {next && list.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-3 border border-primary/40 bg-primary/5 p-4">
            <p className="text-sm text-ink/80">You have a saved address ready — continue to finish your order.</p>
            <button onClick={finishCheckout} className="btn-bold text-sm !py-2.5 shrink-0">Continue to checkout</button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="border border-dashed border-border p-10 text-center bg-secondary/40">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No addresses saved yet.</p>
            <button onClick={openNew} className="btn-bold mt-4 text-sm !py-2.5">Add your first address</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {list.map((a) => (
              <div key={a.id} className="border border-border bg-card p-4 hover-lift transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {a.name}
                      {a.isDefault && (
                        <span className="text-[9px] uppercase tracking-widest bg-primary text-cream px-2 py-0.5 font-bold">Default</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">📱 {a.mobile}{a.altMobile ? ` · ${a.altMobile}` : ""}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 border border-border hover:border-ink transition" aria-label="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => remove(a.id)} className="p-1.5 border border-border hover:border-destructive hover:text-destructive transition" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <p className="text-sm mt-2 text-ink/80 leading-snug">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}{a.landmark ? ` (${a.landmark})` : ""}
                  <br />{a.city}, {a.state} - {a.pincode}
                </p>
                {!a.isDefault && (
                  <button onClick={() => makeDefault(a.id)} className="mt-3 text-[11px] uppercase tracking-widest inline-flex items-center gap-1 border border-border px-2 py-1 hover:border-ink transition">
                    <Star className="h-3 w-3" /> Set default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-3 animate-fade-in">
            <div className="bg-cream w-full max-w-lg border border-border shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="font-condensed text-xl tracking-wide">{editing ? "EDIT ADDRESS" : "ADD ADDRESS"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-secondary" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
              <div className="px-5 py-4 grid sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                <Field label="Name *" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                <Field label="Mobile Number *" value={draft.mobile} onChange={(v) => setDraft({ ...draft, mobile: v })} />
                <Field label="Alternative Mobile" value={draft.altMobile} onChange={(v) => setDraft({ ...draft, altMobile: v })} />
                <Field label="Pincode *" value={draft.pincode} onChange={(v) => setDraft({ ...draft, pincode: v })} />
                <div className="sm:col-span-2"><Field label="Address Line 1 *" value={draft.line1} onChange={(v) => setDraft({ ...draft, line1: v })} /></div>
                <div className="sm:col-span-2"><Field label="Address Line 2" value={draft.line2} onChange={(v) => setDraft({ ...draft, line2: v })} /></div>
                <Field label="Landmark" value={draft.landmark} onChange={(v) => setDraft({ ...draft, landmark: v })} />
                <Field label="City *" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
                <Field label="State *" value={draft.state} onChange={(v) => setDraft({ ...draft, state: v })} />
              </div>
              <div className="px-5 py-3 border-t border-border flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-border py-2.5 text-xs uppercase tracking-widest hover:border-ink transition">Cancel</button>
                <button onClick={submit} className="btn-bold flex-1 justify-center !py-2.5 text-sm">Save</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>,
        document.body
  );
};

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-ink" />
  </div>
);

export default MyAddresses;