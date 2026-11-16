import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Search, X, Package,
  Wallet,
  RefreshCw, } from "lucide-react";
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

  // return (
  //   <AgentPanelLayout
  //     agent={agent}
  //     title="Products & Prices"
  //     onLogout={() => {
  //       logout();
  //       navigate("/agent-panel/login");
  //     }}
  //   >
  //     <div className="min-w-0 w-full space-y-4">
  //       <div className="flex flex-wrap items-end justify-between gap-3">
  //         <div>
  //           <h2 className="text-lg font-semibold">Product price management</h2>
  //           <p className="text-sm text-muted-foreground">
  //             You can increase prices only. Minimum = normal Arrheniux price.
  //             Max = MRP + ₹100. Your share of extra = 80%.
  //           </p>
  //         </div>
  //         <div className="text-xs text-muted-foreground">
  //           Showing {filtered.length} of {products.length}
  //           {priceFilter === "edited" ? " (edited only)" : ""}
  //         </div>
  //       </div>

  //       {/* Filters */}
  //       <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
  //         <div className="relative w-full min-w-0 sm:col-span-2 lg:col-span-1">
  //           <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
  //           <input
  //             value={search}
  //             onChange={(e) => setSearch(e.target.value)}
  //             placeholder="Search name or code"
  //             className="w-full min-w-0 rounded-md border bg-background py-2 pl-8 pr-3 text-sm"
  //           />
  //         </div>

  //         <select
  //           value={priceFilter}
  //           onChange={(e) =>
  //             setPriceFilter(e.target.value as "normal" | "edited")
  //           }
  //           className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
  //         >
  //           <option value="normal">All products</option>
  //           <option value="edited">Edited products only</option>
  //         </select>

  //         <select
  //           value={category}
  //           onChange={(e) => {
  //             setCategory(e.target.value);
  //             setType("all");
  //             setSubCategory("all");
  //           }}
  //           className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
  //         >
  //           <option value="all">All categories</option>
  //           {categories.map((c) => (
  //             <option key={c} value={c}>
  //               {c}
  //             </option>
  //           ))}
  //         </select>

  //         <select
  //           value={type}
  //           onChange={(e) => {
  //             setType(e.target.value);
  //             setSubCategory("all");
  //           }}
  //           className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
  //         >
  //           <option value="all">All (Regular / Premium)</option>
  //           {types.map((t) => (
  //             <option key={t} value={t}>
  //               {t}
  //             </option>
  //           ))}
  //         </select>

  //         <select
  //           value={subCategory}
  //           onChange={(e) => setSubCategory(e.target.value)}
  //           className="w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
  //         >
  //           <option value="all">All subcategories</option>
  //           {subCategories.map((s) => (
  //             <option key={s} value={s}>
  //               {s}
  //             </option>
  //           ))}
  //         </select>
  //       </div>

  //       {error ? (
  //         <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
  //           {error}
  //         </div>
  //       ) : null}

  //       {loading ? (
  //         <div className="py-8 text-center text-sm text-muted-foreground">
  //           Loading products…
  //         </div>
  //       ) : filtered.length === 0 ? (
  //         <div className="py-8 text-center text-sm text-muted-foreground">
  //           No products match your filters.
  //         </div>
  //       ) : (
  //         <div className="space-y-8">
  //           {Array.from(groups.entries()).map(([cat, tierMap]) => (
  //             <section key={cat}>
  //               <h3 className="mb-3 break-words text-sm font-semibold uppercase tracking-wide text-muted-foreground">
  //                 {cat}
  //               </h3>
  //               {Array.from(tierMap.entries()).map(([tier, list]) => (
  //                 <div key={`${cat}-${tier}`} className="mb-5">
  //                   <div className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
  //                     {tier}
  //                   </div>
  //                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  //                     {list.map((p) => (
  //                       <div
  //                         key={p.id}
  //                         className="flex min-w-0 gap-3 rounded-xl border p-3"
  //                       >
  //                         <img
  //                           src={p.image || "/placeholder.svg"}
  //                           alt={p.name}
  //                           className="h-16 w-16 shrink-0 rounded-md bg-muted object-cover"
  //                         />
  //                         <div className="min-w-0 flex-1 overflow-hidden">
  //                           <div className="truncate text-sm font-semibold">
  //                             {p.name}
  //                           </div>
  //                           <div className="truncate font-mono text-[11px] text-muted-foreground">
  //                             {p.code}
  //                           </div>
  //                           {p.subCategory ? (
  //                             <div className="truncate text-[11px] text-muted-foreground">
  //                               {p.subCategory}
  //                             </div>
  //                           ) : null}

  //                           {(() => {
  //                             const margin = Math.max(
  //                               0,
  //                               Number(p.agentPrice) - Number(p.originalPrice),
  //                             );
  //                             const agentPart = Math.round(margin * 0.8);
  //                             const companyPart = margin - agentPart;
  //                             return (
  //                               <div className="mt-1 space-y-1 text-[11px]">
  //                                 <div className="grid grid-cols-3 gap-1">
  //                                   <div>
  //                                     <div className="text-muted-foreground">
  //                                       Normal
  //                                     </div>
  //                                     <div className="font-medium">
  //                                       {formatINR(p.originalPrice)}
  //                                     </div>
  //                                   </div>
  //                                   <div>
  //                                     <div className="text-muted-foreground">
  //                                       Agent
  //                                     </div>
  //                                     <div className="font-medium">
  //                                       {formatINR(p.agentPrice)}
  //                                     </div>
  //                                   </div>
  //                                   <div>
  //                                     <div className="text-muted-foreground">
  //                                       Extra
  //                                     </div>
  //                                     <div className="font-medium">
  //                                       {formatINR(margin)}
  //                                     </div>
  //                                   </div>
  //                                 </div>
  //                                 <div className="leading-snug text-muted-foreground">
  //                                   You{" "}
  //                                   <span className="font-medium text-emerald-700 dark:text-emerald-400">
  //                                     {formatINR(agentPart)} (80%)
  //                                   </span>
  //                                   {" · "}
  //                                   Arrheniux {formatINR(companyPart)} (20%)
  //                                 </div>
  //                               </div>
  //                             );
  //                           })()}

  //                           <div className="mt-2 flex flex-wrap gap-2">
  //                             <button
  //                               type="button"
  //                               disabled={savingId === p.id}
  //                               onClick={() => setEditing(p)}
  //                               className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-50"
  //                             >
  //                               Edit price
  //                             </button>
  //                             {p.hasCustomPrice ? (
  //                               <button
  //                                 type="button"
  //                                 disabled={savingId === p.id}
  //                                 onClick={() => void resetPrice(p)}
  //                                 className="rounded-md border px-2.5 py-1 text-[11px] disabled:opacity-50"
  //                               >
  //                                 Reset to normal
  //                               </button>
  //                             ) : (
  //                               <span className="self-center text-[11px] text-muted-foreground">
  //                                 Using normal price
  //                               </span>
  //                             )}
  //                           </div>
  //                         </div>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 </div>
  //               ))}
  //             </section>
  //           ))}
  //         </div>
  //       )}
  //     </div>

  //     {editing ? (
  //       <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
  //         <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
  //           <button
  //             type="button"
  //             className="absolute right-1 top-1 z-10 rounded-full border bg-background p-1 shadow"
  //             onClick={() => setEditing(null)}
  //             aria-label="Close"
  //           >
  //             <X className="h-4 w-4" />
  //           </button>
  //           <AgentPriceEditor
  //             product={editing}
  //             onClose={() => setEditing(null)}
  //             onSave={async (agentPrice) => {
  //               await savePrice(editing, agentPrice);
  //               setEditing(null);
  //             }}
  //           />
  //         </div>
  //       </div>
  //     ) : null}
  //   </AgentPanelLayout>
  // );


return (
  <AgentPanelLayout
    agent={agent}
    title="Products & Prices"
    onLogout={() => {
      logout();
      navigate("/agent-panel/login");
    }}
  >
    <div className="min-w-0 w-full space-y-7">

      {/* ================= PRODUCT HERO ================= */}
      <section className="relative isolate overflow-hidden rounded-[26px] border border-emerald-400/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#075985] p-5 text-white shadow-[0_20px_60px_-22px_rgba(5,150,105,0.5)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Product Management
            </div>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Products & <span className="text-emerald-300">Prices</span>
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-6 text-emerald-50/80 sm:text-sm">
              Manage your product prices, customize your selling price and
              track your earnings on every product.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold text-white/90">
                Minimum: Normal Price
              </span>
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold text-white/90">
                Maximum: MRP + ₹100
              </span>
              <span className="rounded-xl border border-emerald-300/30 bg-emerald-300/15 px-3 py-2 text-[10px] font-black text-emerald-200">
                YOUR SHARE 80%
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-emerald-200">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                Total Products
              </p>
              <p className="text-2xl font-black">{products.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCT SUMMARY ================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-blue-950/50 dark:to-indigo-950/40">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-black text-blue-950 dark:text-white">
            {products.length}
          </p>
          <p className="mt-1 text-[10px] text-blue-800/70 dark:text-blue-200/70">
            Available products
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50 to-green-100 p-4 dark:from-emerald-950/50 dark:to-green-950/40">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Custom Prices
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-950 dark:text-white">
            {products.filter((p) => p.hasCustomPrice).length}
          </p>
          <p className="mt-1 text-[10px] text-emerald-800/70 dark:text-emerald-200/70">
            Products you edited
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-50 to-fuchsia-100 p-4 dark:from-violet-950/50 dark:to-fuchsia-950/40 sm:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
            Filtered Results
          </p>
          <p className="mt-2 text-2xl font-black text-violet-950 dark:text-white">
            {filtered.length}
          </p>
          <p className="mt-1 text-[10px] text-violet-800/70 dark:text-violet-200/70">
            Matching your filters
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-card shadow-sm">
        <div className="border-b border-blue-500/15 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 px-4 py-4 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/30">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-950 dark:text-blue-100">
                Find Your Products
              </h3>
              <p className="mt-0.5 text-[10px] text-blue-800/70 dark:text-blue-200/70">
                Search and filter your product catalogue
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {/* SEARCH */}
          <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Search Product
            </label>
            <Search className="pointer-events-none absolute left-3 top-[37px] h-4 w-4 text-blue-600 dark:text-blue-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or product code"
              className="h-11 w-full min-w-0 rounded-xl border border-blue-500/25 bg-blue-50/60 py-2 pl-9 pr-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:bg-blue-950/20"
            />
          </div>

          {/* PRICE FILTER */}
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Price Status
            </label>
            <select
              value={priceFilter}
              onChange={(e) =>
                setPriceFilter(e.target.value as "normal" | "edited")
              }
className="h-11 w-full min-w-0 rounded-xl border border-emerald-400/40 bg-emerald-50 px-3 text-xs font-bold text-emerald-950 shadow-sm outline-none transition-all hover:border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-500/50 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark] dark:hover:border-emerald-400 dark:focus:border-emerald-400"            >
              <option value="normal" className="bg-slate-800 text-white">All products</option>
              <option value="edited" className="bg-slate-800 text-white">Edited products only</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setType("all");
                setSubCategory("all");
              }}
className="h-11 w-full min-w-0 rounded-xl border border-violet-400/40 bg-violet-50 px-3 text-xs font-bold text-violet-950 shadow-sm outline-none transition-all hover:border-violet-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-violet-500/50 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark] dark:hover:border-violet-400 dark:focus:border-violet-400"            >
              <option value="all" className="bg-slate-800 text-white">All categories</option>
              {categories.map((c) => (
                <option className="bg-slate-800 text-white" key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Product Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setSubCategory("all");
              }}
className="h-11 w-full min-w-0 rounded-xl border border-amber-400/40 bg-amber-50 px-3 text-xs font-bold text-amber-950 shadow-sm outline-none transition-all hover:border-amber-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-amber-500/50 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark] dark:hover:border-amber-400 dark:focus:border-amber-400"            >
              <option value="all" className="bg-slate-800 text-white">All (Regular / Premium)</option>
              {types.map((t) => (
                <option className="bg-slate-800 text-white" key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY */}
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Subcategory
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
className="h-11 w-full min-w-0 rounded-xl border border-cyan-400/40 bg-cyan-50 px-3 text-xs font-bold text-cyan-950 shadow-sm outline-none transition-all hover:border-cyan-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-500/50 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark] dark:hover:border-cyan-400 dark:focus:border-cyan-400"            >
              <option value="all" className="bg-slate-800 text-white">All subcategories</option>
              {subCategories.map((s) => (
                <option className="bg-slate-800 text-white" key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-[11px] font-semibold text-muted-foreground">
            Showing <span className="font-black text-foreground">{filtered.length}</span> of{" "}
            <span className="font-black text-foreground">{products.length}</span> products
            {priceFilter === "edited" ? " · Edited only" : ""}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setType("all");
              setSubCategory("all");
              setPriceFilter("normal");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-50 px-3 py-2 text-[10px] font-black text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
          >
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        </div>
      </section>

      {/* ================= ERROR ================= */}
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Package className="h-7 w-7 animate-pulse" />
          </div>
          <p className="text-sm font-black">Loading products…</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait while we load your catalogue</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-50 to-blue-50 py-16 text-center dark:from-violet-950/20 dark:to-blue-950/20">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white text-violet-600 shadow-md dark:bg-violet-950 dark:text-violet-300">
            <Search className="h-7 w-7" />
          </div>
          <p className="text-base font-black">No products found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        /* ================= PRODUCT GROUPS ================= */
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([cat, tierMap], catIndex) => (
            <section key={cat}>

              {/* CATEGORY HEADER */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#075985] p-4 text-white shadow-[0_12px_30px_-18px_rgba(5,150,105,0.55)] sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/15">
                      <Package className="h-5 w-5 text-emerald-200" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200">
                        Category {catIndex + 1}
                      </p>
                      <h3 className="break-words text-base font-black sm:text-lg">
                        {cat}
                      </h3>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black text-white">
                    {Array.from(tierMap.values()).reduce((sum, list) => sum + list.length, 0)} Products
                  </span>
                </div>
              </div>

              {Array.from(tierMap.entries()).map(([tier, list]) => (
                <div key={`${cat}-${tier}`} className="mb-6">

                  {/* TYPE HEADER */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                    <h4 className="text-xs font-black uppercase tracking-[0.12em] text-violet-800 dark:text-violet-300">
                      {tier}
                    </h4>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-black text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      {list.length}
                    </span>
                  </div>

                  {/* PRODUCT GRID */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    {list.map((p) => (
                      <div
                        key={p.id}
                        className="group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_18px_45px_-22px_rgba(5,150,105,0.4)]"
                      >
                        {/* TOP ACCENT */}
                        <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />

                        <div className="p-3 sm:p-4">

                          {/* PRODUCT DETAILS */}
                          <div className="flex min-w-0 gap-3 sm:gap-4">
                            <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:h-28 sm:w-28">
                              <img
                                src={p.image || "/placeholder.svg"}
                                alt={p.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {p.hasCustomPrice && (
                                <span className="absolute bottom-1 left-1 rounded-md bg-emerald-700 px-1.5 py-1 text-[8px] font-black text-white shadow">
                                  EDITED
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h5 className="line-clamp-2 text-sm font-black leading-5 text-foreground sm:text-base">
                                    {p.name}
                                  </h5>
                                  <p className="mt-1 truncate font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    {p.code}
                                  </p>
                                  {p.subCategory ? (
                                    <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground">
                                      {p.subCategory}
                                    </p>
                                  ) : null}
                                </div>

                                {p.hasCustomPrice ? (
                                  <span className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Custom Price
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  {tier}
                                </span>
                                {p.subCategory && (
                                  <span className="max-w-full truncate rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                    {p.subCategory}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PRICE BREAKDOWN */}
                          {(() => {
                            const margin = Math.max(
                              0,
                              Number(p.agentPrice) - Number(p.originalPrice),
                            );
                            const agentPart = Math.round(margin * 0.8);
                            const companyPart = margin - agentPart;

                            return (
                              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                                      Normal
                                    </p>
                                    <p className="mt-1 truncate text-xs font-black text-slate-800 dark:text-slate-200 sm:text-sm">
                                      {formatINR(p.originalPrice)}
                                    </p>
                                  </div>

                                  <div className="min-w-0 border-x border-border px-2">
                                    <p className="text-[9px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                      Agent Price
                                    </p>
                                    <p className="mt-1 truncate text-xs font-black text-blue-800 dark:text-blue-300 sm:text-sm">
                                      {formatINR(p.agentPrice)}
                                    </p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                      Extra
                                    </p>
                                    <p className="mt-1 truncate text-xs font-black text-emerald-700 dark:text-emerald-300 sm:text-sm">
                                      {formatINR(margin)}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                  <div className="flex h-1.5 w-full">
                                    <div className="h-full w-[80%] bg-emerald-500" />
                                    <div className="h-full w-[20%] bg-blue-500" />
                                  </div>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                    You: {formatINR(agentPart)} (80%)
                                  </span>
                                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                                    Arrheniux: {formatINR(companyPart)} (20%)
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* ACTIONS */}
                          <div className="mt-4 flex flex-col gap-2 min-[400px]:flex-row">
                            <button
                              type="button"
                              disabled={savingId === p.id}
                              onClick={() => setEditing(p)}
                              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-3 py-2.5 text-[11px] font-black text-white shadow-md shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Wallet className="h-3.5 w-3.5" />
                              {savingId === p.id ? "Saving..." : "Edit Price"}
                            </button>

                            {p.hasCustomPrice ? (
                              <button
                                type="button"
                                disabled={savingId === p.id}
                                onClick={() => void resetPrice(p)}
                                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-50 px-3 py-2.5 text-[11px] font-black text-rose-700 transition-all hover:border-rose-500 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${savingId === p.id ? "animate-spin" : ""}`} />
                                Reset Price
                              </button>
                            ) : (
                              <div className="flex min-h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                ✓ Normal Price Active
                              </div>
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

      {/* ================= PRICE EDITOR MODAL ================= */}
      {editing ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-emerald-500/20 bg-background shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)] sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 dark:from-emerald-950 dark:to-cyan-950">
              <div>
                <p className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                  Edit Product Price
                </p>
                <p className="mt-0.5 max-w-[260px] truncate text-[10px] text-emerald-800/70 dark:text-emerald-200/70">
                  {editing.name}
                </p>
              </div>

              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-500/20 bg-rose-50 text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4">
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
        </div>
      ) : null}
    </div>
  </AgentPanelLayout>
);

}
