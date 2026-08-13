import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { catalog } from "@/data/catalog";
import { useReveal } from "@/hooks/useReveal";

/** Tiny transparent placeholder — zero network cost */
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3C/svg%3E";

function useNearViewport<T extends HTMLElement>(rootMargin = "100px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [near, rootMargin]);

  return { ref, near };
}

export const CategoriesGrid = () => {
  const headerRef = useReveal<HTMLDivElement>();
  // Only start loading thumbs when section is close (not on first paint with hero)
  const { ref: sectionRef, near } = useNearViewport<HTMLElement>("80px");

  return (
    <section ref={sectionRef} className="container-x py-20">
      <div
        ref={headerRef}
        className="reveal reveal-up flex items-end justify-between mb-10 flex-wrap gap-4"
      >
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">
  01 — Catalog
</span>
          <h2 className="font-display text-5xl md:text-6xl mt-2">BROWSE CATEGORIES</h2>
        </div>
        <p className="max-w-sm text-muted-foreground text-sm">
          {catalog.length} product categories, organised by Regular and Premium tiers. Every piece
          is fully customizable — fabric, fit, colour, print and embroidery.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {catalog.map((c) => (
          <div key={c.slug} className="tilt-card">
            <Link
              to={`/category/${c.slug}`}
              className="tilt-card-inner group relative block bg-secondary overflow-hidden aspect-[4/5]"
            >
              <img
                src={near ? c.image : PLACEHOLDER}
                alt={c.name}
                width={400}
                height={500}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-muted"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-2xl text-cream leading-tight">
                  {c.name.toUpperCase()}
                </h3>
                <p className="text-xs text-cream/70 mt-0.5">
                  {c.hasTiers ? "Regular · Premium" : "Browse items"}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};