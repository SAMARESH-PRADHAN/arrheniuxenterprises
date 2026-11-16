import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { AgentHeader } from "../components/AgentHeader";
import { AgentSidebar } from "../components/AgentSidebar";
import { AgentPriceEditor } from "../components/AgentPriceEditor";
import { useSalesAgent } from "../hooks/useSalesAgent";
import {
  fetchSalesAgentProducts,
  resetSalesAgentProductPrice,
  updateSalesAgentProductPrice,
} from "../lib/salesAgentApi";
import type { SalesAgentProduct } from "../types/salesAgent";
import { AgentPanelLayout } from "../components/AgentPanelLayout";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function SalesAgentProducts() {
  const {
    agent,
    isAuthenticated,
    loading: sessionLoading,
    logout,
  } = useSalesAgent();
  const navigate = useNavigate();

  const [products, setProducts] = useState<SalesAgentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [editing, setEditing] = useState<SalesAgentProduct | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<"normal" | "edited">("normal");

  const load = useCallback(async () => {
    if (!agent?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchSalesAgentProducts(agent.id, {
        page: 1,
        limit: 500,
      });
      setProducts(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [agent?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // All categories from loaded products
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // Tiers available for selected category (or all products if category = all)
  const types = useMemo(() => {
    const pool =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);
    const set = new Set(pool.map((p) => p.type).filter(Boolean));
    return Array.from(set).sort();
  }, [products, category]);

  // Subcategories for selected category + type
  const subCategories = useMemo(() => {
    const pool = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (type !== "all" && p.type !== type) return false;
      return true;
    });
    const set = new Set(pool.map((p) => p.subCategory).filter(Boolean));
    return Array.from(set).sort();
  }, [products, category, type]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      // Category filter
      if (category !== "all" && p.category !== category) return false;

      // Type filter
      if (type !== "all" && p.type !== type) return false;

      // Subcategory filter
      if (subCategory !== "all" && p.subCategory !== subCategory) {
        return false;
      }

      // Price status filter
      if (priceFilter === "edited" && !p.hasCustomPrice) {
        return false;
      }

      // Search filter
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.subCategory || "").toLowerCase().includes(q)
      );
    });
  }, [products, search, category, type, subCategory, priceFilter]);

  // Group: Category → Type → list
  const groups = useMemo(() => {
    const map = new Map<string, Map<string, SalesAgentProduct[]>>();
    for (const p of filtered) {
      const cat = p.category || "Other";
      const tier = p.type || "Regular";
      if (!map.has(cat)) map.set(cat, new Map());
      const tierMap = map.get(cat)!;
      if (!tierMap.has(tier)) tierMap.set(tier, []);
      tierMap.get(tier)!.push(p);
    }
    return map;
  }, [filtered]);

  const savePrice = async (product: SalesAgentProduct, agentPrice: number) => {
    if (!agent) return;
    if (agentPrice < product.originalPrice) {
      throw new Error(
        `Cannot go below normal price ${formatINR(product.originalPrice)}`,
      );
    }
    setSavingId(product.id);
    try {
      await updateSalesAgentProductPrice(agent.id, product.id, agentPrice);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                agentPrice,
                earningPerUnit: Math.max(0, agentPrice - p.originalPrice),
                hasCustomPrice: agentPrice !== p.originalPrice,
              }
            : p,
        ),
      );
    } finally {
      setSavingId(null);
    }
  };

  const resetPrice = async (product: SalesAgentProduct) => {
    if (!agent) return;
    setSavingId(product.id);
    try {
      await resetSalesAgentProductPrice(agent.id, product.id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                agentPrice: p.originalPrice,
                earningPerUnit: 0,
                hasCustomPrice: false,
              }
            : p,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSavingId(null);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated || !agent) {
    return <Navigate to="/agent-panel/login" replace />;
  }

//   return (

//       <AgentPanelLayout
//         agent={agent}
//         title="Products & Prices" // or "Products & Prices" / "Share My Store"
//         onLogout={() => {
//           logout();
//           navigate("/agent-panel/login");
//         }}
//       >
//         <div className="mx-auto ">
//           {/* <AgentSidebar /> */}

//           <main className="min-w-0 flex-1 p-4 md:p-6">
//             <div className="flex flex-wrap items-end justify-between gap-3">
//               <div>
//                 <h2 className="text-lg font-semibold">
//                   Product price management
//                 </h2>
//                 <p className="text-sm text-muted-foreground">
//                   You can increase prices only. Minimum = normal Arrheniux
//                   price.
//                 </p>
//               </div>
//               <div className="text-xs text-muted-foreground">
//                 Showing {filtered.length} of {products.length} products
//               </div>
//             </div>

//             {/* Filters */}
//             <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
//               <div className="relative w-full min-w-0 sm:col-span-2 lg:col-span-1">
//                 <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search name or code"
//                   className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
//                 />
//               </div>
//               {/* 1. Category */}
//               <select
//                 value={category}
//                 onChange={(e) => {
//                   setCategory(e.target.value);
//                   setType("all");
//                   setSubCategory("all");
//                 }}
//                 className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
//               >
//                 <option value="all">All categories</option>
//                 {categories.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>

//               {/* 2. Regular / Premium */}
//               <select
//                 value={type}
//                 onChange={(e) => {
//                   setType(e.target.value);
//                   setSubCategory("all");
//                 }}
//                 className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
//               >
//                 <option value="all">All (Regular / Premium)</option>
//                 {types.map((t) => (
//                   <option key={t} value={t}>
//                     {t}
//                   </option>
//                 ))}
//               </select>

//               {/* 3. Subcategory — depends on category + type */}
//               <select
//                 value={subCategory}
//                 onChange={(e) => setSubCategory(e.target.value)}
//                 className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
//                 disabled={
//                   category === "all" &&
//                   type === "all" &&
//                   subCategories.length === 0
//                 }
//               >
//                 <option value="all">All subcategories</option>
//                 {subCategories.map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={priceFilter}
//                 onChange={(e) =>
//                   setPriceFilter(e.target.value as "normal" | "edited")
//                 }
//                 className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
//               >
//                 <option value="normal">All products</option>
//                 <option value="edited">Edited products only</option>
//               </select>
//             </div>

//             {error ? (
//               <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
//                 {error}
//               </div>
//             ) : null}

//             {loading ? (
//               <div className="mt-8 text-center text-sm text-muted-foreground">
//                 Loading products…
//               </div>
//             ) : filtered.length === 0 ? (
//               <div className="mt-8 text-center text-sm text-muted-foreground">
//                 No products match your filters.
//               </div>
//             ) : (
//               <div className="mt-6 space-y-8">
//                 {Array.from(groups.entries()).map(([cat, tierMap]) => (
//                   <section key={cat}>
//                     <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
//                       {cat}
//                     </h3>
//                     {Array.from(tierMap.entries()).map(([tier, list]) => (
//                       <div key={`${cat}-${tier}`} className="mb-5">
//                         <div className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
//                           {tier}
//                         </div>
//                         <div className="grid gap-3 sm:grid-cols-2">
//                           {list.map((p) => (
//                             <div
//                               key={p.id}
//                               className="flex min-w-0 gap-3 rounded-xl border p-3"
//                             >
//                               <img
//                                 src={p.image || "/placeholder.svg"}
//                                 alt={p.name}
//                                className="h-16 w-16 shrink-0 rounded-md object-cover bg-muted"
//                               />
//                               <div className="min-w-0 flex-1 overflow-hidden">
//                                 <div className="truncate text-sm font-semibold">
//                                   {p.name}
//                                 </div>
//                                 <div className="truncate font-mono text-[11px] text-muted-foreground">
//                                   {p.code}
//                                 </div>
//                                 {p.subCategory ? (
//                                   <div className="text-[11px] text-muted-foreground">
//                                     {p.subCategory}
//                                   </div>
//                                 ) : null}
//                                 {(() => {
//                                   const margin = Math.max(
//                                     0,
//                                     Number(p.agentPrice) -
//                                       Number(p.originalPrice),
//                                   );
//                                   const agentPart = Math.round(margin * 0.8);
//                                   const companyPart = margin - agentPart;
//                                   return (
//                                     <div className="mt-1 space-y-1 text-[11px]">
// <div className="grid grid-cols-3 gap-1">
//                                         <div>
//                                           <div className="text-muted-foreground">
//                                             Normal
//                                           </div>
//                                           <div className="font-medium">
//                                             {formatINR(p.originalPrice)}
//                                           </div>
//                                         </div>
//                                         <div>
//                                           <div className="text-muted-foreground">
//                                             Agent
//                                           </div>
//                                           <div className="font-medium">
//                                             {formatINR(p.agentPrice)}
//                                           </div>
//                                         </div>
//                                         <div>
//                                           <div className="text-muted-foreground">
//                                             Extra
//                                           </div>
//                                           <div className="font-medium">
//                                             {formatINR(margin)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                       <div className="text-muted-foreground leading-snug">
//                                         You{" "}
//                                         <span className="font-medium text-emerald-700 dark:text-emerald-400">
//                                           {formatINR(agentPart)} (80%)
//                                         </span>
//                                         {" · "}
//                                         Arrheniux {formatINR(companyPart)} (20%)
//                                       </div>
//                                     </div>
//                                   );
//                                 })()}
//                                 <div className="mt-2 flex flex-wrap gap-2">
//                                   <button
//                                     type="button"
//                                     disabled={savingId === p.id}
//                                     onClick={() => setEditing(p)}
//                                     className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
//                                   >
//                                     Edit price
//                                   </button>
//                                   {p.hasCustomPrice ? (
//                                     <button
//                                       type="button"
//                                       disabled={savingId === p.id}
//                                       onClick={() => void resetPrice(p)}
//                                       className="rounded-md border px-2.5 py-1 text-[11px] disabled:opacity-50"
//                                     >
//                                       Reset to normal
//                                     </button>
//                                   ) : (
//                                     <span className="self-center text-[11px] text-muted-foreground">
//                                       Using normal price
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </section>
//                 ))}
//               </div>
//             )}
//           </main>
//         </div>

//         {/* Price editor modal */}
//         {editing ? (
//           <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
//             <div className="relative w-full max-w-md">
//               <button
//                 type="button"
//                 className="absolute -right-1 -top-1 z-10 rounded-full border bg-background p-1 shadow"
//                 onClick={() => setEditing(null)}
//                 aria-label="Close"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//               <AgentPriceEditor
//                 product={editing}
//                 onClose={() => setEditing(null)}
//                 onSave={async (agentPrice) => {
//                   await savePrice(editing, agentPrice);
//                 }}
//               />
//             </div>
//           </div>
//         ) : null}
//       </AgentPanelLayout>
//   );

  return (
    <AgentPanelLayout
      agent={agent}
      title="Products & Prices"
      onLogout={() => {
        logout();
        navigate("/agent-panel/login");
      }}
    >
      <div className="min-w-0 w-full space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Product price management</h2>
            <p className="text-sm text-muted-foreground">
              You can increase prices only. Minimum = normal Arrheniux price.
              Max = MRP + ₹100. Your share of extra = 80%.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {filtered.length} of {products.length}
            {priceFilter === "edited" ? " (edited only)" : ""}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="relative w-full min-w-0 sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or code"
              className="w-full min-w-0 rounded-md border bg-background py-2 pl-8 pr-3 text-sm"
            />
          </div>

          <select
            value={priceFilter}
            onChange={(e) =>
              setPriceFilter(e.target.value as "normal" | "edited")
            }
            className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="normal">All products</option>
            <option value="edited">Edited products only</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setType("all");
              setSubCategory("all");
            }}
            className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSubCategory("all");
            }}
            className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All (Regular / Premium)</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All subcategories</option>
            {subCategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No products match your filters.
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groups.entries()).map(([cat, tierMap]) => (
              <section key={cat}>
                <h3 className="mb-3 break-words text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat}
                </h3>
                {Array.from(tierMap.entries()).map(([tier, list]) => (
                  <div key={`${cat}-${tier}`} className="mb-5">
                    <div className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {tier}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {list.map((p) => (
                        <div
                          key={p.id}
                          className="flex min-w-0 gap-3 rounded-xl border p-3"
                        >
                          <img
                            src={p.image || "/placeholder.svg"}
                            alt={p.name}
                            className="h-16 w-16 shrink-0 rounded-md bg-muted object-cover"
                          />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="truncate text-sm font-semibold">
                              {p.name}
                            </div>
                            <div className="truncate font-mono text-[11px] text-muted-foreground">
                              {p.code}
                            </div>
                            {p.subCategory ? (
                              <div className="truncate text-[11px] text-muted-foreground">
                                {p.subCategory}
                              </div>
                            ) : null}

                            {(() => {
                              const margin = Math.max(
                                0,
                                Number(p.agentPrice) - Number(p.originalPrice),
                              );
                              const agentPart = Math.round(margin * 0.8);
                              const companyPart = margin - agentPart;
                              return (
                                <div className="mt-1 space-y-1 text-[11px]">
                                  <div className="grid grid-cols-3 gap-1">
                                    <div>
                                      <div className="text-muted-foreground">
                                        Normal
                                      </div>
                                      <div className="font-medium">
                                        {formatINR(p.originalPrice)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground">
                                        Agent
                                      </div>
                                      <div className="font-medium">
                                        {formatINR(p.agentPrice)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground">
                                        Extra
                                      </div>
                                      <div className="font-medium">
                                        {formatINR(margin)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="leading-snug text-muted-foreground">
                                    You{" "}
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                      {formatINR(agentPart)} (80%)
                                    </span>
                                    {" · "}
                                    Arrheniux {formatINR(companyPart)} (20%)
                                  </div>
                                </div>
                              );
                            })()}

                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={savingId === p.id}
                                onClick={() => setEditing(p)}
                                className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
                              >
                                Edit price
                              </button>
                              {p.hasCustomPrice ? (
                                <button
                                  type="button"
                                  disabled={savingId === p.id}
                                  onClick={() => void resetPrice(p)}
                                  className="rounded-md border px-2.5 py-1 text-[11px] disabled:opacity-50"
                                >
                                  Reset to normal
                                </button>
                              ) : (
                                <span className="self-center text-[11px] text-muted-foreground">
                                  Using normal price
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              className="absolute right-1 top-1 z-10 rounded-full border bg-background p-1 shadow"
              onClick={() => setEditing(null)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <AgentPriceEditor
              product={editing}
              onClose={() => setEditing(null)}
              onSave={async (agentPrice) => {
                await savePrice(editing, agentPrice);
                setEditing(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </AgentPanelLayout>
  );
}
