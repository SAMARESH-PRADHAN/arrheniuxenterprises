import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewCollectionProducts } from "@/hooks/api";
import { useReveal } from "@/hooks/useReveal";

function useNearViewport<T extends HTMLElement>(rootMargin = "300px") {
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

export const LatestCollection = () => {
  const { ref: sectionRef, near } = useNearViewport<HTMLElement>("300px");
  const { products: items, isLoading, isError, isFetching } =
    useNewCollectionProducts(4, { enabled: near });
  const headerRef = useReveal<HTMLDivElement>();

  const showSkeleton = !near || ((isLoading || isFetching) && items.length === 0);

  return (
    <section ref={sectionRef} className="bg-secondary py-20">
      <div className="container-x">
        <div
          ref={headerRef}
          className="reveal flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">
              02 — Arrheniux Top Wear
            </span>
            <h2 className="font-display text-5xl md:text-6xl mt-2">ARRHENIUX TOP WEAR</h2>
          </div>
          <p className="max-w-sm text-muted-foreground text-sm">
            Our latest top wear styles — engineered for bulk and ready to customize.
          </p>
        </div>
        {showSkeleton ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-card border border-border">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-muted-foreground text-sm">Could not load Arrheniux Top Wear items.</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No Arrheniux Top Wear items yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} p={p as any} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link to="/arreheniux-top-wear" className="btn-bold">
                See All
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};