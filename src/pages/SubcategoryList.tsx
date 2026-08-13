import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { findCategory, getSubsForTier, listingHref } from "@/data/catalog";

const SubcategoryList = () => {
  const { cat: catSlug, tier } = useParams();
  const cat = findCategory(catSlug);
  if (!cat) return <Navigate to="/" replace />;
  // Non-tiered cats: the second URL segment is actually a subcategory slug
  // (or "_") — bounce back to the category landing.
  if (!cat.hasTiers) return <Navigate to={`/category/${cat.slug}`} replace />;
  if (tier !== "regular" && tier !== "premium")
    return <Navigate to={`/category/${cat.slug}`} replace />;

  const subs = getSubsForTier(cat, tier);

  return (
    <Layout>
      <section className="bg-secondary">
        <div className="container-x py-12 md:py-16">
          <div className="text-xs uppercase text-muted-foreground tracking-wide mb-3">
            <Link to="/" className="hover:text-ink">Home</Link> /{" "}
            <Link to={`/category/${cat.slug}`} className="hover:text-ink">{cat.name}</Link>
            {tier && <> / <span className="text-ink">{tier}</span></>}
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">
            {cat.name.toUpperCase()}{" "}
            {tier && <span className="text-primary">— {tier.toUpperCase()}</span>}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">{cat.blurb}</p>
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
