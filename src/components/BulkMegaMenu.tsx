import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import { catalog as fullCatalog, type Tier, isArrheniuxCategory } from "@/data/catalog";
const catalog = fullCatalog.filter((c) => !isArrheniuxCategory(c.slug));

// Mirrors Categories mega menu but funnels selections to /bulk-order with preset params.
export const BulkMegaMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(catalog[0].slug);
  const [activeTier, setActiveTier] = useState<Tier>("regular");
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  const handleEnter = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const cat = catalog.find((c) => c.slug === activeCat) || catalog[0];
  const subs = cat.hasTiers
    ? (activeTier === "regular" ? cat.regular ?? [] : cat.premium ?? [])
    : cat.items ?? [];

  const bulkHref = (sub: string) => {
    const p = new URLSearchParams({ cat: cat.slug, sub });
    if (cat.hasTiers) p.set("tier", activeTier);
    return `/bulk-order?${p.toString()}`;
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Package className="h-3.5 w-3.5" /> Bulk Order <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 animate-fade-in">
          <div className="navbar-glass bg-cream/95 border border-border shadow-2xl w-[860px] max-w-[90vw] grid grid-cols-[240px_180px_1fr] rounded-lg overflow-hidden">
            <ul className="border-r border-border py-2 max-h-[420px] overflow-y-auto">
              {catalog.map((c) => (
                <li key={c.slug}>
                  <button
                    onMouseEnter={() => { setActiveCat(c.slug); setActiveTier("regular"); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition ${
                      activeCat === c.slug ? "bg-ink text-cream" : "hover:bg-secondary text-ink"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-r border-border py-2">
              {cat.hasTiers ? (
                (["regular", "premium"] as Tier[]).map((t) => (
                  <button
                    key={t}
                    onMouseEnter={() => setActiveTier(t)}
                    className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest font-semibold transition ${
                      activeTier === t ? "bg-secondary text-ink" : "hover:bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground">Browse</div>
              )}
              <Link
                to={`/bulk-order?cat=${cat.slug}`}
                onClick={() => setOpen(false)}
                className="block mt-2 mx-4 text-[11px] uppercase tracking-widest text-primary font-semibold hover:underline"
              >
                Bulk quote for category →
              </Link>
            </div>

            <div className="py-2 max-h-[420px] overflow-y-auto">
              <div className="px-4 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                {cat.hasTiers ? `${activeTier} subcategories` : "Items"}
              </div>
              <ul className="grid grid-cols-2 gap-x-2">
                {subs.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to={bulkHref(s.slug)}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-1.5 text-sm hover:text-primary text-ink transition"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
