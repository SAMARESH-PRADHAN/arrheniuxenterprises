// import { useMemo } from "react";
// import { Link } from "react-router-dom";
// import { Layout } from "@/components/Layout";
// import { useProducts } from "@/hooks/api";
// import { mapApiProductToCatalog } from "@/lib/productMappers";
// import { findCategory, findSubcategory } from "@/data/catalog";
// import { BrandLoader } from "@/components/BrandLoader";

// /** Build path to subcategory product list (normal order flow). */
// function subcategoryHref(p: {
//   categorySlug: string;
//   tier?: string;
//   subSlug: string;
// }) {
//   const cat = findCategory(p.categorySlug);
//   if (!cat) return "/";
//   if (cat.hasTiers && p.tier) {
//     return `/category/${p.categorySlug}/${p.tier}/${p.subSlug}`;
//   }
//   // categories without tiers use "_" or only cat/sub depending on your routes
//   return `/category/${p.categorySlug}/_/${p.subSlug}`;
// }

// export default function AllProducts() {
//   const { data: apiProducts = [], isLoading } = useProducts({ status: "Active" });

//   const products = useMemo(() => {
//     return apiProducts
//       .filter((p) => {
//         const vis = p.visibility ?? "Both";
//         return vis === "Bulk" || vis === "Both";
//       })
//       .map((p) => mapApiProductToCatalog(p));
//   }, [apiProducts]);

//   return (
//     <Layout>
//       <section className="container-x py-12">
//         <h1 className="font-display text-4xl md:text-6xl mb-2">ALL CUSTOM PRODUCTS</h1>
//         <p className="text-muted-foreground mb-10">
//           Browse our catalogue. Click any product to open its subcategory and order the usual way.
//         </p>

//         {isLoading ? (
//           <BrandLoader />
//         ) : products.length === 0 ? (
//           <p className="text-muted-foreground">No products listed yet.</p>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {products.map((p) => (
//               <Link
//                 key={p.id}
//                 to={subcategoryHref(p)}
//                 className="group border border-border bg-card overflow-hidden"
//               >
//                 <div className="aspect-square bg-secondary overflow-hidden">
//                   <img
//                     src={p.image}
//                     alt={p.name}
//                     className="w-full h-full object-cover transition group-hover:scale-105"
//                     loading="lazy"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <h3 className="font-condensed text-lg tracking-wide">
//                     {p.name.toUpperCase()}
//                   </h3>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {findCategory(p.categorySlug)?.name}
//                     {p.subSlug ? ` · ${findSubcategory(findCategory(p.categorySlug)!, p.tier, p.subSlug)?.name ?? ""}` : ""}
//                   </p>
//                   <p className="text-sm mt-2">{p.price}<span className="text-xs text-muted-foreground">/pc</span></p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </section>
//     </Layout>
//   );
// }

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BrandLoader } from "@/components/BrandLoader";
import { useProducts } from "@/hooks/api";
import { mapApiProductToCatalog } from "@/lib/productMappers";
import {
  catalog,
  findCategory,
  findSubcategory,
  type CatalogProduct,
} from "@/data/catalog";

/** Path to subcategory product list (normal order flow). */
function subcategoryHref(p: CatalogProduct) {
  const cat = findCategory(p.categorySlug);
  if (!cat) return "/";
  if (cat.hasTiers && p.tier) {
    return `/category/${p.categorySlug}/${p.tier}/${p.subSlug}`;
  }
  // no-tier categories use "_" as tier segment (same as your ProductList routes)
  return `/category/${p.categorySlug}/_/${p.subSlug}`;
}

function tierLabel(tier?: string) {
  if (tier === "premium") return "Premium";
  if (tier === "regular") return "Regular";
  return null;
}

function subLabel(p: CatalogProduct) {
  const cat = findCategory(p.categorySlug);
  if (!cat) return p.subSlug;
  return findSubcategory(cat, p.tier, p.subSlug)?.name ?? p.subSlug;
}

// Categories that do NOT show the 40% badge (same idea as ProductCard)
const NO_DISCOUNT_CATEGORIES = [
  "arrheniux-t-shirts",
  "custom-accessories",
  "corporate-welcome-kit",
  "new-collection",
];

function showDiscountBadge(categorySlug: string) {
  return !NO_DISCOUNT_CATEGORIES.includes(categorySlug);
}
// type Group = {
//   catSlug: string;
//   catName: string;
//   tier?: string; // "regular" | "premium" | undefined
//   subSlug: string;
//   subName: string;
//   products: CatalogProduct[];
// };

function AllProducts() {
  const { data: apiProducts = [], isLoading } = useProducts({
    status: "Active",
  });

  const products = useMemo(() => {
    return apiProducts
      .filter((p) => {
        const vis = p.visibility ?? "Both";
        return vis === "Bulk" || vis === "Both";
      })
      .map((p) => mapApiProductToCatalog(p));
  }, [apiProducts]);

  const byCategory = useMemo(() => {
    const catOrder = new Map(catalog.map((c, i) => [c.slug, i]));
    const map = new Map<
      string,
      { catSlug: string; catName: string; products: CatalogProduct[] }
    >();

    for (const p of products) {
      const cat = findCategory(p.categorySlug);
      if (!cat) continue;
      if (!map.has(p.categorySlug)) {
        map.set(p.categorySlug, {
          catSlug: p.categorySlug,
          catName: cat.name,
          products: [],
        });
      }
      map.get(p.categorySlug)!.products.push(p);
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        (catOrder.get(a.catSlug) ?? 999) - (catOrder.get(b.catSlug) ?? 999),
    );
  }, [products]);

  // Group by category → tier → subcategory (catalog order)
  //   const groups = useMemo(() => {
  //     const map = new Map<string, Group>();

  //     for (const p of products) {
  //       const cat = findCategory(p.categorySlug);
  //       if (!cat) continue;

  //       const sub = findSubcategory(cat, p.tier, p.subSlug);
  //       const subName = sub?.name ?? p.subSlug;
  //       const tierKey = p.tier ?? "";
  //       const key = `${p.categorySlug}::${tierKey}::${p.subSlug}`;

  //       if (!map.has(key)) {
  //         map.set(key, {
  //           catSlug: p.categorySlug,
  //           catName: cat.name,
  //           tier: p.tier,
  //           subSlug: p.subSlug,
  //           subName,
  //           products: [],
  //         });
  //       }
  //       map.get(key)!.products.push(p);
  //     }

  //     // Sort by catalog category order, then regular before premium, then sub name
  //     const catOrder = new Map(catalog.map((c, i) => [c.slug, i]));
  //     const tierOrder = (t?: string) =>
  //       t === "regular" ? 0 : t === "premium" ? 1 : 2;

  //     return Array.from(map.values()).sort((a, b) => {
  //       const ca = catOrder.get(a.catSlug) ?? 999;
  //       const cb = catOrder.get(b.catSlug) ?? 999;
  //       if (ca !== cb) return ca - cb;
  //       if (tierOrder(a.tier) !== tierOrder(b.tier)) {
  //         return tierOrder(a.tier) - tierOrder(b.tier);
  //       }
  //       return a.subName.localeCompare(b.subName);
  //     });
  //   }, [products]);

  //   // Nested structure for headings: Category → (optional Tier) → Sub → products
  //   const tree = useMemo(() => {
  //     type SubNode = {
  //       subName: string;
  //       subSlug: string;
  //       href: string;
  //       products: CatalogProduct[];
  //     };
  //     type TierNode = { tierLabel: string | null; subs: SubNode[] };
  //     type CatNode = { catName: string; catSlug: string; tiers: TierNode[] };

  //     const cats: CatNode[] = [];
  //     let currentCat: CatNode | null = null;
  //     let currentTier: TierNode | null = null;

  //     for (const g of groups) {
  //       if (!currentCat || currentCat.catSlug !== g.catSlug) {
  //         currentCat = { catName: g.catName, catSlug: g.catSlug, tiers: [] };
  //         cats.push(currentCat);
  //         currentTier = null;
  //       }

  //       const tierLabel = g.tier
  //         ? g.tier === "premium"
  //           ? "Premium"
  //           : "Regular"
  //         : null;

  //       if (!currentTier || currentTier.tierLabel !== tierLabel) {
  //         currentTier = { tierLabel, subs: [] };
  //         currentCat.tiers.push(currentTier);
  //       }

  //       const sample = g.products[0];
  //       currentTier.subs.push({
  //         subName: g.subName,
  //         subSlug: g.subSlug,
  //         href: sample ? subcategoryHref(sample) : `/category/${g.catSlug}`,
  //         products: g.products,
  //       });
  //     }

  //     return cats;
  //   }, [groups]);

  return (
    <Layout>
      {/* Hero */}
     <section className="relative overflow-hidden min-h-[280px] md:min-h-[380px] lg:min-h-[420px] text-cream">
  {/* Background collage image */}
  <img
    src="src/assets/all-products-hero.avif"
    alt=""
    className="absolute inset-0 h-full w-full object-cover object-center scale-105"
    loading="eager"
  />

  {/* Dark overlays so title stays readable */}
  <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/35" />
  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/40" />

  <div className="container-x relative z-10 py-14 md:py-20 lg:py-24">
    <p className="mb-3 text-xs uppercase tracking-[0.25em] text-cream/60">
      Catalogue
    </p>
    <h1 className="font-display text-5xl leading-none tracking-tight drop-shadow-lg md:text-7xl">
      ALL CUSTOM PRODUCTS
    </h1>
    <p className="mt-4 max-w-xl text-sm text-cream/80 md:text-base">
      Browse by category and subcategory. Tap any product to open that
      subcategory and order the usual way.
    </p>
  </div>

  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/90" />
</section>

      <section className="container-x py-12 md:py-16 space-y-16">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <BrandLoader />
          </div>
        ) : byCategory.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">
            No products listed for ALL CUSTOM PRODUCTS yet. In admin, turn on
            &quot;Show in ALL CUSTOM PRODUCTS section&quot; for products you want here.
          </p>
        ) : (
          <>
            {/* Sticky category jump links */}
            <div className="sticky top-20 z-20 -mx-4 mb-10 border-b border-border bg-cream/90 px-4 py-3 backdrop-blur md:-mx-0 md:px-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Jump to category
              </p>
              <div className="flex flex-wrap gap-2">
                {byCategory.map((c) => (
                  <a
                    key={c.catSlug}
                    href={`#cat-${c.catSlug}`}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(`cat-${c.catSlug}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    {c.catName}
                  </a>
                ))}
              </div>
            </div>
            {byCategory.map((cat) => (
              <div
                key={cat.catSlug}
                id={`cat-${cat.catSlug}`}
                className="space-y-6 scroll-mt-28"
              >
                {/* Category heading */}
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Category
                    </p>
                    <h2 className="font-display text-3xl tracking-tight md:text-5xl">
                      {cat.catName.toUpperCase()}
                    </h2>
                  </div>
                  <Link
                    to={`/category/${cat.catSlug}`}
                    className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    View category →
                  </Link>
                </div>

                {/* 3 products per row on desktop */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.products.map((p) => {
                    const sub = subLabel(p);
                    const tier = tierLabel(p.tier);

                    return (
                      <Link
                        key={p.id}
                        to={subcategoryHref(p)}
                        className="group flex flex-col overflow-hidden border border-border bg-card transition hover:border-primary/40 hover:shadow-lg"
                      >
                        <div className="relative aspect-square overflow-hidden bg-secondary">
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex flex-1 flex-col gap-1.5 p-4">
                          <h3 className="font-condensed text-base tracking-wide leading-snug line-clamp-2 md:text-lg">
                            {p.name.toUpperCase()}
                          </h3>

                          {/* Subcategory + Regular/Premium under product */}
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-ink/80">
                              {sub}
                            </span>
                            {tier && (
                              <>
                                <span className="mx-1.5 text-border">·</span>
                                <span
                                  className={
                                    tier === "Premium"
                                      ? "font-semibold text-primary"
                                      : "font-medium"
                                  }
                                >
                                  {tier}
                                </span>
                              </>
                            )}
                          </p>

                          <div className="mt-auto flex flex-col gap-1.5 pt-2">
  <p className="font-display text-lg leading-none">
    {p.price}
    <span className="text-xs font-sans text-muted-foreground">
      /pc
    </span>
  </p>

  {showDiscountBadge(p.categorySlug) && (
    <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-accent to-primary px-2.5 py-1 text-[15px] font-bold uppercase tracking-wider text-cream shadow-sm">
      Up to 40% off
    </span>
  )}
</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </Layout>
  );
}

export default AllProducts;
