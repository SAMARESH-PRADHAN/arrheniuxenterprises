import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { catalog, listingHref, type Tier } from "@/data/catalog";

export const MegaMenu = () => {
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

  // Reset tier if cat has no tiers
  useEffect(() => {
    if (cat.hasTiers && !["regular", "premium"].includes(activeTier)) setActiveTier("regular");
  }, [cat.hasTiers, activeTier]);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <LayoutGrid className="h-3.5 w-3.5" /> Categories <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50">
          <div className="bg-cream border border-border shadow-xl w-[860px] max-w-[90vw] grid grid-cols-[240px_180px_1fr]">
            {/* Categories column */}
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

            {/* Tier column */}
            <div className="border-r border-border py-2">
              {cat.hasTiers ? (
                <>
                  {(["regular", "premium"] as Tier[]).map((t) => (
                    <button
                      key={t}
                      onMouseEnter={() => setActiveTier(t)}
                      className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-widest font-semibold transition ${
                        activeTier === t ? "bg-secondary text-ink" : "hover:bg-secondary/60 text-muted-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-2.5 text-xs uppercase tracking-widest text-muted-foreground">
                  Browse
                </div>
              )}
              <Link
                to={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="block mt-2 mx-4 text-[11px] uppercase tracking-widest text-primary font-semibold hover:underline"
              >
                View category →
              </Link>
            </div>

            {/* Subcategories column */}
            <div className="py-2 max-h-[420px] overflow-y-auto">
              <div className="px-4 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                {cat.hasTiers ? `${activeTier} subcategories` : "Items"}
              </div>
              <ul className="grid grid-cols-2 gap-x-2">
                {subs.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to={listingHref(cat.slug, cat.hasTiers ? activeTier : undefined, s.slug)}
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
