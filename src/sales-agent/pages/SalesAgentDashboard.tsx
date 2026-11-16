import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
// import { Package, Share2, RefreshCw } from "lucide-react";
import { AgentHeader } from "../components/AgentHeader";
import { AgentSidebar } from "../components/AgentSidebar";
import { AgentStatsCard } from "../components/AgentStatsCard";
import { useSalesAgent } from "../hooks/useSalesAgent";
import {
  fetchSalesAgentOrders,
  fetchSalesAgentStats,
} from "../lib/salesAgentApi";
import type { SalesAgentOrder, SalesAgentStats } from "../types/salesAgent";
import { AgentPanelLayout } from "../components/AgentPanelLayout";
import {
  Package,
  Share2,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function statusClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("deliver"))
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
  if (s.includes("ship"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
  if (s.includes("product"))
    return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300";
  if (s.includes("confirm"))
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300";
  return "bg-muted text-muted-foreground";
}

export default function SalesAgentDashboard() {
  const {
    agent,
    isAuthenticated,
    loading: sessionLoading,
    logout,
  } = useSalesAgent();
  const navigate = useNavigate();

  const [stats, setStats] = useState<SalesAgentStats | null>(null);
  const [orders, setOrders] = useState<SalesAgentOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
    const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const ORDERS_LIMIT = 10;

   const load = async (agentId: string, page = ordersPage) => {
    setLoadingData(true);
    setError("");
    try {
      const [s, o] = await Promise.all([
        fetchSalesAgentStats(agentId),
        fetchSalesAgentOrders(agentId, { page, limit: ORDERS_LIMIT }),
      ]);
      setStats(s);
      setOrders(o.data ?? []);
      const total = o.pagination?.total ?? o.data?.length ?? 0;
      const limit = o.pagination?.limit ?? ORDERS_LIMIT;
      setOrdersTotalPages(Math.max(1, Math.ceil(total / limit)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (agent?.id) {
      void load(agent.id, ordersPage);
    }
  }, [agent?.id, ordersPage]);

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!isAuthenticated || !agent) {
    return <Navigate to="/agent-panel/login" replace />;
  }
  //   return (
  //   <AgentPanelLayout
  //     agent={agent}
  //     title="Dashboard"
  //     onLogout={() => {
  //       logout();
  //       navigate("/agent-panel/login");
  //     }}
  //   >
  //     <div className="min-w-0 w-full space-y-4">
  //       <div className="flex flex-wrap items-center justify-between gap-3">
  //         <div>
  //           <h2 className="text-lg font-semibold">Dashboard</h2>
  //           <p className="text-sm text-muted-foreground">
  //             Overview of your store performance and recent orders
  //           </p>
  //         </div>
  //         <button
  //           type="button"
  //           onClick={() => void load(agent.id, ordersPage)}
  //           disabled={loadingData}
  //           className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
  //         >
  //           <RefreshCw
  //             className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
  //           />
  //           Refresh
  //         </button>
  //       </div>

  //       {error ? (
  //         <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
  //           {error}
  //         </div>
  //       ) : null}

  //       {/* KPI cards — volume */}
  //       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  //         <AgentStatsCard
  //           label="Total Orders"
  //           value={loadingData && !stats ? "…" : (stats?.totalOrders ?? 0)}
  //         />
  //         <AgentStatsCard
  //           label="Total Customers"
  //           value={loadingData && !stats ? "…" : (stats?.totalCustomers ?? 0)}
  //         />
  //         <AgentStatsCard
  //           label="Total Sales"
  //           value={
  //             loadingData && !stats ? "…" : formatINR(stats?.totalSales ?? 0)
  //           }
  //           hint="What customers paid"
  //         />
  //       </div>

  //       {/* KPI cards — earnings */}
  //       <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  //         <AgentStatsCard
  //           label="Total margin"
  //           value={
  //             loadingData && !stats ? "…" : formatINR(stats?.totalMargin ?? 0)
  //           }
  //           hint="Extra above MRP (all orders)"
  //         />
  //         <AgentStatsCard
  //           label="You earned (80%)"
  //           value={
  //             loadingData && !stats
  //               ? "…"
  //               : formatINR(stats?.totalEarnings ?? 0)
  //           }
  //           hint="Your share of margin"
  //         />
  //         <AgentStatsCard
  //           label="You received"
  //           value={
  //             loadingData && !stats
  //               ? "…"
  //               : formatINR(stats?.totalReceived ?? 0)
  //           }
  //           hint="Admin marked order payout Paid"
  //         />
  //         <AgentStatsCard
  //           label="Pending payout"
  //           value={
  //             loadingData && !stats
  //               ? "…"
  //               : formatINR(stats?.totalPending ?? 0)
  //           }
  //           hint="Not paid by admin yet"
  //         />
  //       </div>

  //       <p className="text-xs text-muted-foreground">
  //         Of every extra amount above MRP, <strong>80%</strong> is your earning
  //         and <strong>20%</strong> goes to Arrheniux. Received + Pending should
  //         equal You earned (80%).
  //       </p>

  //       {!loadingData && stats && (
  //         <div className="rounded-lg border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
  //           Arrheniux share (20%):{" "}
  //           <span className="font-medium text-foreground">
  //             {formatINR(stats.totalPlatformEarnings ?? 0)}
  //           </span>
  //           {" · "}
  //           Check: earned {formatINR(stats.totalEarnings ?? 0)} = received{" "}
  //           {formatINR(stats.totalReceived ?? 0)} + pending{" "}
  //           {formatINR(stats.totalPending ?? 0)}
  //         </div>
  //       )}

  //       {/* Quick actions */}
  //       <div className="grid gap-3 sm:grid-cols-2">
  //         <Link
  //           to="/agent-panel/products"
  //           className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
  //         >
  //           <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
  //             <Package className="h-5 w-5" />
  //           </div>
  //           <div className="min-w-0">
  //             <div className="text-sm font-semibold">Products & prices</div>
  //             <div className="text-xs text-muted-foreground">
  //               {stats?.pricedProductCount ?? 0} products with custom prices
  //             </div>
  //           </div>
  //         </Link>

  //         <Link
  //           to="/agent-panel/share"
  //           className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
  //         >
  //           <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
  //             <Share2 className="h-5 w-5" />
  //           </div>
  //           <div className="min-w-0">
  //             <div className="text-sm font-semibold">Share My Store</div>
  //             <div className="truncate text-xs text-muted-foreground">
  //               /agent/{agent.shareToken?.slice(0, 10)}…
  //             </div>
  //           </div>
  //         </Link>
  //       </div>

  //       {/* Recent orders */}
  //       <section>
  //         <div className="mb-3 flex items-center justify-between">
  //           <h3 className="text-sm font-semibold">Recent orders</h3>
  //           <span className="text-xs text-muted-foreground">
  //             Page {ordersPage} · 10 per page
  //           </span>
  //         </div>

  //         <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
  //           <table className="w-full min-w-[720px] text-left text-sm">
  //             <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
  //               <tr>
  //                 <th className="px-3 py-2 font-medium">Order</th>
  //                 <th className="px-3 py-2 font-medium">Customer</th>
  //                 <th className="px-3 py-2 font-medium">Product</th>
  //                 <th className="px-3 py-2 font-medium">Qty</th>
  //                 <th className="px-3 py-2 font-medium">Total</th>
  //                 <th className="px-3 py-2 font-medium">Earning</th>
  //                 <th className="px-3 py-2 font-medium">Your payout</th>
  //                 <th className="px-3 py-2 font-medium">Status</th>
  //                 <th className="px-3 py-2 font-medium">Date</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {loadingData && orders.length === 0 ? (
  //                 <tr>
  //                   <td
  //                     colSpan={9}
  //                     className="px-3 py-8 text-center text-muted-foreground"
  //                   >
  //                     Loading orders…
  //                   </td>
  //                 </tr>
  //               ) : orders.length === 0 ? (
  //                 <tr>
  //                   <td
  //                     colSpan={9}
  //                     className="px-3 py-8 text-center text-muted-foreground"
  //                   >
  //                     No sales agent orders yet. Share your store link to get
  //                     started.
  //                   </td>
  //                 </tr>
  //               ) : (
  //                 orders.map((o) => (
  //                   <tr key={o.id} className="border-b last:border-0">
  //                     <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
  //                     <td className="px-3 py-2">
  //                       <div className="font-medium">{o.customer || "—"}</div>
  //                       <div className="text-[11px] text-muted-foreground">
  //                         {o.phone || ""}
  //                       </div>
  //                     </td>
  //                     <td className="px-3 py-2">
  //                       <div className="max-w-[160px] truncate">
  //                         {o.productName}
  //                       </div>
  //                       <div className="text-[11px] font-mono text-muted-foreground">
  //                         {o.productCode}
  //                       </div>
  //                     </td>
  //                     <td className="px-3 py-2 tabular-nums">{o.qty}</td>
  //                     <td className="px-3 py-2 tabular-nums">
  //                       {formatINR(o.totalAmount)}
  //                     </td>
  //                     <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-400">
  //                       {formatINR(o.agentEarning ?? 0)}
  //                     </td>
  //                     <td className="px-3 py-2">
  //                       <span
  //                         className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
  //                           o.agentPayoutStatus === "Paid"
  //                             ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
  //                             : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
  //                         }`}
  //                       >
  //                         {o.agentPayoutStatus === "Paid"
  //                           ? "Received"
  //                           : "Pending"}
  //                       </span>
  //                     </td>
  //                     <td className="px-3 py-2">
  //                       <span
  //                         className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(o.status)}`}
  //                       >
  //                         {o.status}
  //                       </span>
  //                     </td>
  //                     <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
  //                       {o.date}
  //                     </td>
  //                   </tr>
  //                 ))
  //               )}
  //             </tbody>
  //           </table>
  //         </div>

  //         {ordersTotalPages > 1 && (
  //           <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
  //             <p className="text-xs text-muted-foreground">
  //               Page {ordersPage} of {ordersTotalPages}
  //             </p>
  //             <div className="flex gap-2">
  //               <button
  //                 type="button"
  //                 disabled={ordersPage <= 1 || loadingData}
  //                 onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
  //                 className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
  //               >
  //                 Previous
  //               </button>
  //               <button
  //                 type="button"
  //                 disabled={ordersPage >= ordersTotalPages || loadingData}
  //                 onClick={() =>
  //                   setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))
  //                 }
  //                 className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
  //               >
  //                 Next
  //               </button>
  //             </div>
  //           </div>
  //         )}
  //       </section>
  //     </div>
  //   </AgentPanelLayout>
  // );


return (
  <AgentPanelLayout
    agent={agent}
    title="Dashboard"
    onLogout={() => {
      logout();
      navigate("/agent-panel/login");
    }}
  >
    <div className="min-w-0 w-full space-y-8">

      {/* ================= PREMIUM HERO ================= */}
      <section className="relative isolate overflow-hidden rounded-[28px] border border-emerald-400/30 bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#075985] p-6 text-white shadow-[0_20px_65px_-20px_rgba(5,150,105,0.55)] sm:p-8">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-8 h-32 w-32 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="max-w-2xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
              Sales Agent Dashboard
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back,{" "}
              <span className="text-emerald-300">{agent.name}</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/80">
              Monitor your sales, customers, earnings and store performance
              from one powerful dashboard.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/90 backdrop-blur">
                Agent Code:{" "}
                <span className="font-mono font-black text-emerald-300">
                  {agent.code}
                </span>
              </span>

              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white/90 backdrop-blur">
                Commission:{" "}
                <span className="font-black text-emerald-300">80%</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load(agent.id, ordersPage)}
            disabled={loadingData}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 px-5 py-3 text-xs font-black text-white shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/25 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </section>

      {/* ================= ERROR ================= */}
      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* ================= SALES OVERVIEW ================= */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-500 shadow-sm" />
            <h3 className="text-xl font-black tracking-tight">Sales Overview</h3>
          </div>
          <p className="mt-1 pl-4 text-xs text-muted-foreground">
            Your store performance at a glance
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL ORDERS */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-blue-400/40 bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#312e81] p-5 text-white shadow-[0_14px_35px_-16px_rgba(37,99,235,0.65)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-15px_rgba(37,99,235,0.65)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-300/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                  Total Orders
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight">
                  {loadingData && !stats ? "…" : (stats?.totalOrders ?? 0)}
                </p>
                <p className="mt-2 text-[11px] font-medium text-blue-100/80">
                  Orders through your store
                </p>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* CUSTOMERS */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-purple-400/40 bg-gradient-to-br from-[#7e22ce] via-[#6b21a8] to-[#4c1d95] p-5 text-white shadow-[0_14px_35px_-16px_rgba(126,34,206,0.65)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-15px_rgba(126,34,206,0.65)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-100">
                  Total Customers
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight">
                  {loadingData && !stats ? "…" : (stats?.totalCustomers ?? 0)}
                </p>
                <p className="mt-2 text-[11px] font-medium text-purple-100/80">
                  Customers acquired
                </p>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* TOTAL SALES */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-[#047857] via-[#065f46] to-[#064e3b] p-5 text-white shadow-[0_14px_35px_-16px_rgba(5,150,105,0.65)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-15px_rgba(5,150,105,0.65)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                  Total Sales
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight">
                  {loadingData && !stats ? "…" : formatINR(stats?.totalSales ?? 0)}
                </p>
                <p className="mt-2 text-[11px] font-medium text-emerald-100/80">
                  Paid by customers
                </p>
              </div>

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner">
                <CircleDollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= YOUR EARNINGS ================= */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-sm" />
            <h3 className="text-xl font-black tracking-tight">Agent Earnings</h3>
          </div>
          <p className="mt-1 pl-4 text-xs text-muted-foreground">
            Track your margin and payout progress
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* MARGIN */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#92400e] via-[#b45309] to-[#78350f] p-5 text-white shadow-[0_12px_30px_-15px_rgba(217,119,6,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/20 blur-2xl group-hover:scale-150" />
            <div className="relative flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-100">Total Margin</p>
              <Wallet className="h-5 w-5 text-amber-200" />
            </div>
            <p className="relative mt-4 text-2xl font-black">
              {loadingData && !stats ? "…" : formatINR(stats?.totalMargin ?? 0)}
            </p>
            <p className="relative mt-1 text-[11px] font-medium text-amber-100/80">Extra above MRP</p>
          </div>

          {/* EARNED */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-[#047857] via-[#059669] to-[#065f46] p-5 text-white shadow-[0_12px_30px_-15px_rgba(5,150,105,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/20 blur-2xl group-hover:scale-150" />
            <div className="relative flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-100">Agent Earned</p>
              <TrendingUp className="h-5 w-5 text-emerald-200" />
            </div>
            <p className="relative mt-4 text-2xl font-black">
              {loadingData && !stats ? "…" : formatINR(stats?.totalEarnings ?? 0)}
            </p>
            <p className="relative mt-1 text-[11px] font-medium text-emerald-100/80">Your 80% share</p>
          </div>

          {/* RECEIVED */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-[#0e7490] via-[#0369a1] to-[#164e63] p-5 text-white shadow-[0_12px_30px_-15px_rgba(8,145,178,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-200/20 blur-2xl group-hover:scale-150" />
            <div className="relative flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-100">Agent Received</p>
              <CircleDollarSign className="h-5 w-5 text-cyan-200" />
            </div>
            <p className="relative mt-4 text-2xl font-black">
              {loadingData && !stats ? "…" : formatINR(stats?.totalReceived ?? 0)}
            </p>
            <p className="relative mt-1 text-[11px] font-medium text-cyan-100/80">Paid by admin</p>
          </div>

          {/* PENDING */}
          <div className="group relative isolate overflow-hidden rounded-2xl border border-rose-400/40 bg-gradient-to-br from-[#be123c] via-[#9f1239] to-[#881337] p-5 text-white shadow-[0_12px_30px_-15px_rgba(225,29,72,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/20 blur-2xl group-hover:scale-150" />
            <div className="relative flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-100">Pending Payout</p>
              <Wallet className="h-5 w-5 text-rose-200" />
            </div>
            <p className="relative mt-4 text-2xl font-black">
              {loadingData && !stats ? "…" : formatINR(stats?.totalPending ?? 0)}
            </p>
            <p className="relative mt-1 text-[11px] font-medium text-rose-100/80">Awaiting admin payout</p>
          </div>
        </div>

        {/* COMMISSION DISTRIBUTION */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-100 via-white to-cyan-100 p-5 shadow-sm dark:from-emerald-950/50 dark:via-card dark:to-cyan-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-950 dark:text-emerald-200">Commission Distribution</p>
              <p className="mt-1 text-xs text-emerald-900/70 dark:text-muted-foreground">
                Every extra amount above MRP is divided between Agent and Arrheniux.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl border border-emerald-600/20 bg-emerald-700 px-4 py-2 text-[10px] font-black text-white shadow-sm">AGENT 80%</span>
              <span className="rounded-xl border border-slate-500/20 bg-slate-800 px-4 py-2 text-[10px] font-black text-white shadow-sm">ARRHENIUX 20%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EARNINGS CHECK ================= */}
      {!loadingData && stats && (
        <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-5 py-4 shadow-sm dark:from-indigo-950/30 dark:via-card dark:to-violet-950/30">
          <div className="flex flex-col gap-3 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-indigo-800 dark:text-indigo-300">Arrheniux Share (20%)</p>
              <p className="mt-1 text-sm font-black text-indigo-950 dark:text-white">
                {formatINR(stats.totalPlatformEarnings ?? 0)}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-white/70 px-4 py-3 dark:bg-white/5">
              <p className="text-[10px] font-bold text-muted-foreground">Earnings Verification</p>
              <p className="mt-1 font-black text-foreground">
                {formatINR(stats.totalEarnings ?? 0)} = {formatINR(stats.totalReceived ?? 0)} + {formatINR(stats.totalPending ?? 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= QUICK ACTIONS ================= */}
      <section>
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            <h3 className="text-xl font-black tracking-tight">Quick Actions</h3>
          </div>
          <p className="mt-1 pl-4 text-xs text-muted-foreground">
            Manage your products and grow your store
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {/* PRODUCTS */}
          <Link
            to="/agent-panel/products"
            className="group relative isolate overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#064e3b] p-5 text-white shadow-[0_12px_35px_-15px_rgba(5,150,105,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(5,150,105,0.65)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl transition-transform duration-500 group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner transition-transform duration-300 group-hover:scale-110">
                <Package className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black">Products & Prices</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-xs font-medium text-emerald-100/80">
                  {stats?.pricedProductCount ?? 0} products with custom prices
                </p>
              </div>
            </div>
          </Link>

          {/* SHARE STORE */}
          <Link
            to="/agent-panel/share"
            className="group relative isolate overflow-hidden rounded-2xl border border-blue-400/40 bg-gradient-to-br from-[#1e40af] via-[#1d4ed8] to-[#172554] p-5 text-white shadow-[0_12px_35px_-15px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(37,99,235,0.65)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl transition-transform duration-500 group-hover:scale-150" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-inner transition-transform duration-300 group-hover:scale-110">
                <Share2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black">Share My Store</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="mt-1 truncate text-xs font-medium text-blue-100/80">
                  /agent/{agent.shareToken?.slice(0, 10)}…
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= RECENT ORDERS ================= */}
      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <h3 className="text-xl font-black tracking-tight">Recent Orders</h3>
            </div>
            <p className="mt-1 pl-4 text-xs text-muted-foreground">
              Latest orders generated from your store
            </p>
          </div>

          <span className="w-fit rounded-xl border border-blue-500/20 bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            Page {ordersPage} · 10 per page
          </span>
        </div>

        <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-border bg-card shadow-md">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-50 text-[10px] uppercase tracking-[0.12em] text-slate-700 dark:from-slate-900 dark:via-blue-950/50 dark:to-indigo-950/50 dark:text-slate-300">
              <tr>
                <th className="px-4 py-4 font-black">Order</th>
                <th className="px-4 py-4 font-black">Customer</th>
                <th className="px-4 py-4 font-black">Product</th>
                <th className="px-4 py-4 font-black">Qty</th>
                <th className="px-4 py-4 font-black">Total</th>
                <th className="px-4 py-4 font-black">Earning</th>
                <th className="px-4 py-4 font-black">Payout</th>
                <th className="px-4 py-4 font-black">Status</th>
                <th className="px-4 py-4 font-black">Date</th>
              </tr>
            </thead>

            <tbody>
              {loadingData && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      </div>
                      <span className="text-xs font-semibold">Loading orders…</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-muted-foreground">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 text-emerald-700 dark:from-emerald-950 dark:to-cyan-950 dark:text-emerald-300">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-black text-foreground">No sales yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Share your store link to start receiving orders.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-blue-50/70 dark:hover:bg-blue-950/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                      {o.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold">{o.customer || "—"}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{o.phone || ""}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="max-w-[180px] truncate font-semibold">{o.productName}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{o.productCode}</div>
                    </td>

                    <td className="px-4 py-3 font-bold tabular-nums">{o.qty}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">{formatINR(o.totalAmount)}</td>

                    <td className="px-4 py-3 font-black tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatINR(o.agentEarning ?? 0)}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${
                        o.agentPayoutStatus === "Paid"
                          ? "border border-emerald-500/20 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border border-amber-500/20 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                      }`}>
                        {o.agentPayoutStatus === "Paid" ? "✓ Received" : "◷ Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border border-current/10 px-2.5 py-1 text-[10px] font-black ${statusClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-muted-foreground">
                      {o.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {ordersTotalPages > 1 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Page{" "}
              <span className="font-black text-foreground">{ordersPage}</span>
              {" "}of {ordersTotalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={ordersPage <= 1 || loadingData}
                onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-blue-500/25 bg-card px-5 py-2.5 text-[11px] font-black transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={ordersPage >= ordersTotalPages || loadingData}
                onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                className="rounded-xl border border-blue-500/25 bg-card px-5 py-2.5 text-[11px] font-black transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  </AgentPanelLayout>
);



}
