import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Building2 } from "lucide-react";
import { B2B_SUBCATEGORIES } from "@/data/catalog";

export const B2BMegaMenu = () => {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  const handleEnter = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        to="/b2b-shop"
        className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1.5"
      >
        <Building2 className="h-3.5 w-3.5" /> B2B Shop{" "}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </Link>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div className="bg-cream border border-border shadow-xl w-[300px] max-w-[90vw] py-2 animate-fade-in">
            {B2B_SUBCATEGORIES.map((s) => (
              <Link
                key={s.slug}
                to={`/b2b-shop?sub=${s.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm hover:bg-secondary text-ink transition"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};