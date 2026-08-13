import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { findCategory, findSubcategory } from "@/data/catalog";
import { useCatalogProducts } from "@/hooks/api";
import { useReveal, staggerDelay } from "@/hooks/useReveal";

const PAGE_SIZE = 12;

const ProductList = () => {
  const { cat: catSlug, tier: tierParam, sub } = useParams();
  const cat = findCategory(catSlug);
  if (!cat) return <Navigate to="/" replace />;

  const tier = tierParam === "_" ? undefined : tierParam;
  const subcat = findSubcategory(cat, tier, sub);
  if (!subcat) return <Navigate to={`/category/${cat.slug}`} replace />;

  const { products: items, isLoading, isError } = useCatalogProducts(cat.slug, tier, subcat.slug);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => { setVisible(PAGE_SIZE); }, [subcat.slug]);

  const shown = useMemo(() => items.slice(0, visible), [items, visible]);
  const hasMore = visible < items.length;

  return (
    <Layout>
      <section className="bg-secondary">
        <div className="container-x py-12 md:py-16">
          <div className="text-xs uppercase text-muted-foreground tracking-wide mb-3">
            <Link to="/" className="hover:text-ink">Home</Link> /{" "}
            <Link to={`/category/${cat.slug}`} className="hover:text-ink">{cat.name}</Link>
            {tier && <> / <Link to={`/category/${cat.slug}/${tier}`} className="hover:text-ink">{tier}</Link></>}
            {" "}/ <span className="text-ink">{subcat.name}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none">{subcat.name.toUpperCase()}</h1>
          <p className="mt-3 text-muted-foreground">Order from 1–99 pcs · Auto bulk discounts · 7–14 day delivery</p>
        </div>
      </section>

      <section className="container-x py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex flex-col bg-card border border-border">
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
          <p className="text-muted-foreground">Could not load products. Check your API connection.</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No products yet in this subcategory.</p>
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
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        }, { threshold: 0.1 });
        obs.observe(el);
      }}
    >
      <ProductCard p={p as any} hidePrice={cat.slug === "corporate-welcome-kit"} />
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
