import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, Package, ShieldCheck, ChevronDown, MapPin } from "lucide-react";
import { clearSession, type SessionUser } from "@/lib/session";

export const UserMenu = ({ user, onChange }: { user: SessionUser; onChange: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const logout = () => {
    clearSession();
    onChange();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide border border-ink text-ink px-3 py-2 rounded-md hover:bg-ink hover:text-cream transition"
      >
        <UserIcon className="h-3.5 w-3.5" />
        <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-cream border border-border shadow-xl z-50">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          <Link
            to="/my-orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"
          >
            <Package className="h-4 w-4" /> My Orders
          </Link>
          <Link
            to="/my-addresses"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"
          >
            <MapPin className="h-4 w-4" /> My Address
          </Link>
          {user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Panel
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary border-t border-border"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};
