import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { reviews as seedReviews } from "@/data/site";
import { useReviews } from "@/hooks/api";
import { useReveal } from "@/hooks/useReveal";

type Item = { name: string; role?: string; rating: number; text: string };

/** Defer /api/reviews until the section is near the viewport (off critical path). */
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

export const Reviews = () => {
  const { ref: sectionRef, near } = useNearViewport<HTMLElement>("300px");
  const { data: userReviews = [], isLoading, isFetching } = useReviews("Approved", {
    enabled: near,
  });

  const items: Item[] = useMemo(() => {
    const fromUsers: Item[] = userReviews.map((r) => ({
      name: r.name,
      role: r.subject,
      rating: r.rating,
      text: r.text,
    }));
    return [...fromUsers, ...seedReviews];
  }, [userReviews]);

  const marquee = [...items, ...items];
  const headerRef = useReveal<HTMLDivElement>();

  const showSkeleton = near && (isLoading || isFetching) && userReviews.length === 0;

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="bg-ink text-cream py-20 overflow-hidden"
    >
      <div className="container-x">
        <div
          ref={headerRef}
          className="reveal flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">
              10 — Reactions
            </span>
            <h2 className="font-display text-5xl md:text-6xl mt-2">CLIENT REACTIONS</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <div>
              <div className="font-display text-2xl">4.9 / 5</div>
              <div className="text-xs text-cream/60 uppercase tracking-wide">
                {showSkeleton ? "…" : `${items.length}+`} reactions
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSkeleton ? (
        <div className="container-x flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-[320px] h-40 shrink-0 bg-cream/10" />
          ))}
        </div>
      ) : (
        <div className="relative group">
          <style>{`
            @keyframes arr-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .arr-marquee-track { animation: arr-marquee 60s linear infinite; }
            .arr-marquee-wrap:hover .arr-marquee-track { animation-play-state: paused; }
          `}</style>
          <div className="arr-marquee-wrap">
            <div className="arr-marquee-track flex gap-4 w-max px-5 md:px-10">
              {marquee.map((r, i) => (
                <div
                  key={i}
                  className="w-[320px] shrink-0 border border-cream/15 p-6 flex flex-col gap-3 hover:border-accent transition bg-ink"
                >
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-cream/85 text-sm leading-relaxed line-clamp-5">"{r.text}"</p>
                  <div className="mt-auto pt-3 border-t border-cream/10">
                    <div className="font-condensed text-lg tracking-wide">
                      {r.name.toUpperCase()}
                    </div>
                    {r.role && <div className="text-xs text-cream/50">{r.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};