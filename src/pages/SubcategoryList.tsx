import { useParams, Link, Navigate } from "react-router-dom";
import { ChevronRight, Scissors } from "lucide-react";
import { Layout } from "@/components/Layout";
import { findCategory, getSubsForTier, listingHref } from "@/data/catalog";

const SubcategoryList = () => {
  const { cat: catSlug, tier } = useParams();
  const cat = findCategory(catSlug);
  if (!cat) return <Navigate to="/" replace />;
  if (!cat.hasTiers) return <Navigate to={`/category/${cat.slug}`} replace />;
  if (tier !== "regular" && tier !== "premium")
    return <Navigate to={`/category/${cat.slug}`} replace />;

  const subs = getSubsForTier(cat, tier);
  const bannerSrc =
  tier === "premium"
    ? cat.premiumBanner || cat.banner || cat.image
    : tier === "regular"
      ? cat.regularBanner || cat.banner || cat.image
      : cat.banner || cat.image;

  return (
    <Layout>
      <section className="relative bg-[#e8e0cf] py-8 md:py-12">
        <div className="container-x">
          {/* Outer "fabric tag" panel */}
          <div
            className="relative overflow-hidden rounded-[6px] min-h-[380px] md:min-h-[480px]"
            style={{
              boxShadow:
                "0 1px 0 hsl(0 0% 100% / 0.5), 0 18px 40px -14px hsl(0 0% 8% / 0.45), 0 2px 6px hsl(0 0% 8% / 0.25), inset 0 0 0 1px hsl(0 0% 8% / 0.15)",
            }}
          >
            {/* Stitched border — dashed inset like a sewn hem */}
            <div
              className="pointer-events-none absolute inset-[10px] md:inset-4 z-20 rounded-[3px]"
              style={{
                border: "2px dashed hsl(44 38% 92% / 0.55)",
                boxShadow: "0 1px 0 hsl(0 0% 8% / 0.4)",
              }}
            />
            {/* Corner stitch crosses */}
            {[
              "top-3 left-3 md:top-5 md:left-5",
              "top-3 right-3 md:top-5 md:right-5",
              "bottom-3 left-3 md:bottom-5 md:left-5",
              "bottom-3 right-3 md:bottom-5 md:right-5",
            ].map((pos, i) => (
              <div key={i} className={`pointer-events-none absolute ${pos} z-20 h-3 w-3 opacity-60`}>
                <div className="absolute inset-0 rotate-45 border-t border-cream/70" />
                <div className="absolute inset-0 -rotate-45 border-t border-cream/70" />
              </div>
            ))}

            {bannerSrc && (
              <img
                src={bannerSrc}
                alt=""
                width={1600}
                height={700}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Woven fabric texture overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-multiply"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, hsl(0 0% 0%) 0px, hsl(0 0% 0%) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(-45deg, hsl(0 0% 0%) 0px, hsl(0 0% 0%) 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Base gradient wash for legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/75 to-ink/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/40" />

            {/* Inner top highlight — glossy sheen like a pressed label */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream/10 to-transparent" />
            {/* Inner bottom shade — deboss effect */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

            <div className="relative z-10 h-full min-h-[380px] md:min-h-[480px] flex flex-col justify-center px-6 md:px-14 py-12">
              {/* Breadcrumb — embossed pill, like a stamped tag corner */}
              <nav
                className="inline-flex w-fit items-center gap-1.5 text-[10px] uppercase tracking-widest mb-6 text-cream/75 px-3.5 py-1.5 rounded-full flex-wrap"
                style={{
                  background: "hsl(0 0% 8% / 0.35)",
                  boxShadow:
                    "inset 0 1px 2px hsl(0 0% 0% / 0.6), inset 0 -1px 0 hsl(0 0% 100% / 0.08), 0 1px 0 hsl(0 0% 100% / 0.05)",
                }}
              >
                <Link to="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-2.5 w-2.5 text-cream/30" />
                <Link
                  to={`/category/${cat.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {cat.name}
                </Link>
                {tier && (
                  <>
                    <ChevronRight className="h-2.5 w-2.5 text-cream/30" />
                    <span className="text-accent font-semibold">{tier}</span>
                  </>
                )}
              </nav>

              {/* Tier badge — stitched fabric patch */}
              {tier && (
                <div
                  className="inline-flex w-fit items-center gap-2 mb-5 px-4 py-2 rounded-[3px]"
                  style={{
                    background:
                      tier === "premium"
                        ? "linear-gradient(180deg, hsl(25 70% 58%), hsl(25 70% 48%))"
                        : "linear-gradient(180deg, hsl(145 55% 32%), hsl(145 55% 24%))",
                    border: "1px dashed hsl(44 38% 96% / 0.5)",
                    boxShadow:
                      "0 3px 6px hsl(0 0% 8% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.25), inset 0 -2px 3px hsl(0 0% 0% / 0.3)",
                  }}
                >
                  <Scissors className="h-3 w-3 text-cream/90" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    {tier === "premium" ? "Premium Collection" : "Regular Collection"}
                  </span>
                </div>
              )}

              {/* Embossed heading — carved/pressed into the label */}
              <h1
                className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-cream"
                style={{
                  textShadow:
                    "0 1px 0 hsl(0 0% 100% / 0.15), 0 2px 4px hsl(0 0% 0% / 0.6), 0 6px 18px hsl(0 0% 0% / 0.35)",
                }}
              >
                {cat.name.toUpperCase()}
              </h1>
              {tier && (
                <h2
                  className="font-condensed text-xl md:text-2xl mt-2 tracking-[0.2em] text-cream/60"
                  style={{ textShadow: "0 1px 1px hsl(0 0% 0% / 0.5)" }}
                >
                  {tier.toUpperCase()} TIER
                </h2>
              )}

              {/* Description on a slightly recessed panel, like a sewn-in care label */}
              <div
                className="mt-6 max-w-lg rounded-[3px] px-4 py-3"
                style={{
                  background: "hsl(0 0% 0% / 0.25)",
                  borderLeft: "3px solid hsl(25 70% 55%)",
                  boxShadow: "inset 0 1px 3px hsl(0 0% 0% / 0.5)",
                }}
              >
                <p className="text-cream/80 text-sm md:text-[15px] leading-relaxed">
                  {cat.blurb}
                </p>
              </div>

              {/* Stats — raised buttons, like pressed metal snaps */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 text-ink text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, hsl(44 38% 98%), hsl(44 30% 88%))",
                    boxShadow:
                      "0 3px 6px hsl(0 0% 8% / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.8), inset 0 -2px 2px hsl(0 0% 70% / 0.5)",
                  }}
                >
                  {subs.length} {subs.length === 1 ? "Style" : "Styles"}
                </span>
                <span
                  className="inline-flex items-center gap-2 text-cream/85 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full"
                  style={{
                    background: "hsl(0 0% 100% / 0.06)",
                    boxShadow:
                      "inset 0 1px 3px hsl(0 0% 0% / 0.5), inset 0 -1px 0 hsl(0 0% 100% / 0.05)",
                  }}
                >
                  Factory Direct
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        {subs.length === 0 ? (
          <p className="text-muted-foreground">No subcategories yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subs.map((s) => (
              <Link
                key={s.slug}
                to={listingHref(cat.slug, cat.hasTiers ? tier : undefined, s.slug)}
                className="group relative block bg-secondary overflow-hidden aspect-[4/5]"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-condensed text-xl text-cream tracking-wide leading-tight">
                    {s.name.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-cream/70 mt-1 uppercase tracking-widest">
                    {s.products.length} styles
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default SubcategoryList;