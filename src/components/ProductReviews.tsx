import { Star, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductReviews } from "@/hooks/api";

export const ProductReviews = ({ productId }: { productId: string }) => {
  const { data: reviews = [], isLoading } = useProductReviews(productId);

  if (isLoading) {
    return (
      <section className="container-x py-16 border-t border-border">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="container-x py-16 border-t border-border">
        <h2 className="font-display text-4xl md:text-5xl mb-4">VERIFIED REVIEWS</h2>
        <p className="text-muted-foreground text-sm">No reviews yet. Reviews appear here after delivered buyers share feedback from their My Orders page.</p>
      </section>
    );
  }

  const marquee = reviews.length < 4 ? [...reviews, ...reviews, ...reviews] : [...reviews, ...reviews];

  return (
    <section className="py-16 border-t border-border overflow-hidden">
      <div className="container-x flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Verified Buyers</span>
          <h2 className="font-display text-4xl md:text-5xl mt-1">PRODUCT REVIEWS</h2>
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{reviews.length} review{reviews.length === 1 ? "" : "s"}</div>
      </div>

      <div className="relative group">
        <style>{`
          @keyframes prod-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .prod-marquee-track { animation: prod-marquee 45s linear infinite; }
          .prod-marquee-wrap:hover .prod-marquee-track { animation-play-state: paused; }
        `}</style>
        <div className="prod-marquee-wrap">
          <div className="prod-marquee-track flex gap-4 w-max px-5 md:px-10">
            {marquee.map((r, i) => (
              <div key={i} className="w-[320px] shrink-0 border border-border p-5 bg-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-primary font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                </div>
                <p className="text-sm text-ink/85 leading-relaxed line-clamp-5">"{r.text}"</p>
                <div className="mt-auto pt-3 border-t border-border">
                  <div className="font-condensed text-lg tracking-wide">{r.name.toUpperCase()}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
