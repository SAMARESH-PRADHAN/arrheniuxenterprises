import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { findCategory, listingHref } from "@/data/catalog";

const CategoryTiers = () => {
  const { cat: catSlug } = useParams();
  const cat = findCategory(catSlug);
  if (!cat) return <Navigate to="/" replace />;

  // No tiers → list subcategories directly
  if (!cat.hasTiers) {
    const items = cat.items ?? [];
    return (
      <Layout>
        <section className="bg-secondary">
          <div className="container-x py-12 md:py-16 grid md:grid-cols-2 gap-8 items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Catalog</span>
              <h1 className="font-display text-6xl md:text-8xl leading-none mt-3">{cat.name.toUpperCase()}</h1>
              <p className="mt-4 text-muted-foreground max-w-md">{cat.blurb}</p>
            </div>
            <img src={cat.image} alt={cat.name} loading="lazy" className="w-full max-h-[260px] object-cover" />
          </div>
        </section>
        <section className="container-x py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((s) => (
              <Link
                key={s.slug}
                to={listingHref(cat.slug, undefined, s.slug)}
                className="group relative block bg-secondary overflow-hidden aspect-[4/5]"
              >
                <img src={s.image} alt={s.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-condensed text-xl text-cream tracking-wide">{s.name.toUpperCase()}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Layout>
    );
  }

  // Tier picker
  const tiers = [
    { key: "regular", title: "Regular", desc: "Reliable everyday builds at factory-direct pricing.", count: cat.regular?.length ?? 0 },
    { key: "premium", title: "Premium", desc: "Heavier fabrics, finer finish, top-tier components.", count: cat.premium?.length ?? 0 },
  ].filter((t) => t.count > 0);

  return (
    <Layout>
      <section className="bg-secondary">
        <div className="container-x py-12 md:py-16 grid md:grid-cols-2 gap-8 items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Catalog</span>
            <h1 className="font-display text-6xl md:text-8xl leading-none mt-3">{cat.name.toUpperCase()}</h1>
            <p className="mt-4 text-muted-foreground max-w-md">{cat.blurb}</p>
          </div>
          <img src={cat.image} alt={cat.name} loading="lazy" className="w-full max-h-[260px] object-cover" />
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl md:text-4xl mb-8">CHOOSE A TIER</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {tiers.map((t) => (
            <Link
              key={t.key}
              to={`/category/${cat.slug}/${t.key}`}
              className="group relative block bg-ink text-cream p-8 border-2 border-ink hover:bg-cream hover:text-ink transition aspect-[16/9] overflow-hidden"
            >
              <img src={cat.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-15 transition" />
              <div className="relative">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{t.count} subcategories</span>
                <h3 className="font-display text-5xl md:text-6xl mt-3 leading-none">{t.title.toUpperCase()}</h3>
                <p className="mt-3 max-w-sm text-sm opacity-80">{t.desc}</p>
                <span className="inline-block mt-6 text-xs uppercase tracking-widest font-semibold underline underline-offset-4">Browse {t.title} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryTiers;
