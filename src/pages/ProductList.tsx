import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { findCategory, findSubcategory } from "@/data/catalog";
import { useCatalogProducts } from "@/hooks/api";
import { staggerDelay } from "@/hooks/useReveal";

const PAGE_SIZE = 12;

const ProductList = () => {
  const { cat: catSlug, tier: tierParam, sub } = useParams();
  const cat = findCategory(catSlug);
  if (!cat) return <Navigate to="/" replace />;

  const tier = tierParam === "_" ? undefined : tierParam;
  const subcat = findSubcategory(cat, tier, sub);
  if (!subcat) return <Navigate to={`/category/${cat.slug}`} replace />;

  const {
    products: items,
    isLoading,
    isError,
  } = useCatalogProducts(cat.slug, tier, subcat.slug);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [subcat.slug]);

  const shown = useMemo(() => items.slice(0, visible), [items, visible]);
  const hasMore = visible < items.length;

  // One banner per category (shared by all its subcategories)
  const bannerSrc = subcat.banner || cat.banner || subcat.image;

  return (
    <Layout>
      {/* <section className="relative overflow-hidden bg-secondary min-h-[220px] md:min-h-[280px]">
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
                /{" "}
                <Link
                  to={`/category/${cat.slug}/${tier}`}
                  className="hover:text-cream"
                >
                  {tier}
                </Link>
              </>
            )}{" "}
            / <span className="text-cream">{subcat.name}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl leading-none">
            {subcat.name.toUpperCase()}
          </h1>
          <p className="mt-3 text-cream/80">
            Order from 1–99 pcs · Auto bulk discounts · 7–14 day delivery
          </p>
        </div>
      </section> */}
      <section className="relative overflow-hidden bg-secondary min-h-[280px] md:min-h-[380px] lg:min-h-[420px]">
  {bannerSrc && (
    <img
      src={bannerSrc}
      alt={subcat.name}
      width={1920}
      height={700}
      className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 ease-out"
      loading="lazy"
    />
  )}

  {/* Soft dark gradient for text readability */}
  <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/20" />
  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

  {/* Subtle bottom edge line */}
  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/80" />

  <div className="container-x relative z-10 py-14 md:py-20 lg:py-24 text-cream">
    <div className="text-xs uppercase tracking-wide mb-3 text-cream/70">
      <Link to="/" className="hover:text-cream transition-colors">
        Home
      </Link>{" "}
      /{" "}
      <Link to={`/category/${cat.slug}`} className="hover:text-cream transition-colors">
        {cat.name}
      </Link>
      {tier && (
        <>
          {" "}
          /{" "}
          <Link
            to={`/category/${cat.slug}/${tier}`}
            className="hover:text-cream transition-colors"
          >
            {tier}
          </Link>
        </>
      )}{" "}
      / <span className="text-cream">{subcat.name}</span>
    </div>

    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight drop-shadow-lg">
      {subcat.name.toUpperCase()}
    </h1>
    <p className="mt-4 text-cream/85 text-sm md:text-base max-w-xl">
      Order from 1–99 pcs · Auto bulk discounts · 7–14 day delivery
    </p>
  </div>
</section>

      <section className="container-x py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-card border border-border"
              >
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-muted-foreground">
            Could not load products. Check your API connection.
          </p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">
            No products yet in this subcategory.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shown.map((p, i) => (
                <div
                  key={p.id}
                  className="reveal reveal-up"
                  style={{ transitionDelay: `${staggerDelay(i % 12)}ms` }}
                  ref={(el) => {
                    if (!el) return;
                    const obs = new IntersectionObserver(
                      ([entry]) => {
                        if (entry.isIntersecting) {
                          el.classList.add("is-visible");
                          obs.unobserve(el);
                        }
                      },
                      { threshold: 0.1 },
                    );
                    obs.observe(el);
                  }}
                >
                  <ProductCard
                    p={p as any}
                    hidePrice={cat.slug === "corporate-welcome-kit"}
                  />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="btn-bold"
                >
                  Load More ({items.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

export default ProductList;
