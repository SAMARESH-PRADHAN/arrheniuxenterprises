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
        <section className="relative overflow-hidden bg-secondary min-h-[320px] md:min-h-[420px] lg:min-h-[480px]">
          <img
            src={cat.banner || cat.image}
            alt={cat.name}
            width={1920}
            height={700}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
          <div className="container-x relative z-10 py-16 md:py-20 lg:py-24">
            <span className="text-xs font-bold uppercase tracking-widest text-cream/70">
              Catalog
            </span>
            <h1 className="font-display text-6xl md:text-8xl leading-none mt-3 text-cream">
              {cat.name.toUpperCase()}
            </h1>
            <p className="mt-4 text-cream/85 max-w-md">{cat.blurb}</p>
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
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-condensed text-xl text-cream tracking-wide">
                    {s.name.toUpperCase()}
                  </h3>
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
    {
      key: "regular",
      title: "Regular",
      desc: "Reliable everyday builds at factory-direct pricing.",
      count: cat.regular?.length ?? 0,
    },
    {
      key: "premium",
      title: "Premium",
      desc: "Heavier fabrics, finer finish, top-tier components.",
      count: cat.premium?.length ?? 0,
    },
  ].filter((t) => t.count > 0);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-secondary min-h-[320px] md:min-h-[420px] lg:min-h-[480px]">
        <img
          src={cat.banner || cat.image}
          alt={cat.name}
          width={1920}
          height={700}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        <div className="container-x relative z-10 py-16 md:py-20 lg:py-24">
          <span className="text-xs font-bold uppercase tracking-widest text-cream/70">
            Catalog
          </span>
          <h1 className="font-display text-6xl md:text-8xl leading-none mt-3 text-cream">
            {cat.name.toUpperCase()}
          </h1>
          <p className="mt-4 text-cream/85 max-w-md">{cat.blurb}</p>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="font-display text-3xl md:text-4xl mb-8">
          CHOOSE A TIER
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
         {tiers.map((t) => (
  <Link
  key={t.key}
  to={`/category/${cat.slug}/${t.key}`}
  className="group relative block"
>
  <div className="relative bg-ink text-cream p-8 border-2 border-ink hover:border-primary transition-all duration-300 aspect-[16/9] overflow-hidden shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:scale-[1.02]">
      <img
        src={
          t.key === "premium"
            ? cat.premiumBanner || cat.banner || cat.image
            : cat.regularBanner || cat.banner || cat.image
        }
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-25 group-hover:scale-105 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

      {/* Clickable cue badge */}
      <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 bg-cream text-ink text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md group-hover:bg-primary group-hover:text-cream transition-colors">
        Tap to Browse
      </span>

      <div className="relative h-full flex flex-col justify-end">
        <span className="text-[10px] uppercase tracking-widest font-bold text-cream/70">{t.count} subcategories</span>
        <h3 className="font-display text-5xl md:text-6xl mt-2 leading-none">{t.title.toUpperCase()}</h3>
        <p className="mt-3 max-w-sm text-sm text-cream/80">{t.desc}</p>
        <span className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-widest font-bold bg-primary text-cream px-4 py-2.5 rounded-full w-fit group-hover:bg-cream group-hover:text-ink transition-colors">
          Browse {t.title}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </div>
  </Link>
))}
        </div>
      </section>
    </Layout>
  );
};

export default CategoryTiers;
