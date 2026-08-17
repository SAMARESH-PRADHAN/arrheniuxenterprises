import { useParams, Link, Navigate } from "react-router-dom";
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
  const bannerSrc = cat.banner || cat.image;

  return (
    <Layout>
      <section className="relative overflow-hidden bg-secondary min-h-[220px] md:min-h-[280px]">
        {bannerSrc && (
          <img
            src={bannerSrc}
            alt=""
            width={1600}
            height={600}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-ink/55" />

        <div className="container-x relative z-10 py-12 md:py-16 text-cream">
          <div className="text-xs uppercase tracking-wide mb-3 text-cream/70">
            <Link to="/" className="hover:text-cream">
              Home
            </Link>{" "}
            /{" "}
            <Link to={`/category/${cat.slug}`} className="hover:text-cream">
              {cat.name}
            </Link>
            {tier && (
              <>
                {" "}
                / <span className="text-cream">{tier}</span>
              </>
            )}
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            {cat.name.toUpperCase()}{" "}
            {tier && (
              <span className="text-accent">— {tier.toUpperCase()}</span>
            )}
          </h1>
          <p className="mt-4 text-cream/80 max-w-xl">{cat.blurb}</p>
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