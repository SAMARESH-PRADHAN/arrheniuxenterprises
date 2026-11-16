import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Package, Share2, RefreshCw } from "lucide-react";
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

  // return (
  //   <div className="min-h-screen bg-background">
  //     {/* <AgentPanelLayout
  //       agent={agent}
  //       title="Dashboard" // or "Products & Prices" / "Share My Store"
  //       onLogout={() => {
  //         logout();
  //         navigate("/agent-panel/login");
  //       }}
  //     > */}
       

  //       <div className="min-w-0 w-full space-y-4">
  //         {/* <AgentSidebar /> */}

  //         <main className="min-w-0 flex-1 p-4 md:p-6">
  //           <div className="flex flex-wrap items-center justify-between gap-3">
  //             <div>
  //               <h2 className="text-lg font-semibold">Dashboard</h2>
  //               <p className="text-sm text-muted-foreground">
  //                 Overview of your store performance and recent orders
  //               </p>
  //             </div>
  //             <button
  //               type="button"
  //               onClick={() => void load(agent.id, ordersPage)}
  //               disabled={loadingData}
  //               className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
  //             >
  //               <RefreshCw
  //                 className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
  //               />
  //               Refresh
  //             </button>
  //           </div>

  //           {error ? (
  //             <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
  //               {error}
  //             </div>
  //           ) : null}
  //                       {/* KPI cards — volume */}
  //           <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  //             <AgentStatsCard
  //               label="Total Orders"
  //               value={loadingData && !stats ? "…" : (stats?.totalOrders ?? 0)}
  //             />
  //             <AgentStatsCard
  //               label="Total Customers"
  //               value={loadingData && !stats ? "…" : (stats?.totalCustomers ?? 0)}
  //             />
  //             <AgentStatsCard
  //               label="Total Sales"
  //               value={
  //                 loadingData && !stats ? "…" : formatINR(stats?.totalSales ?? 0)
  //               }
  //               hint="What customers paid"
  //             />
  //           </div>

  //           {/* KPI cards — earnings (from orders, 80/20) */}
  //           <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  //             <AgentStatsCard
  //               label="Total margin"
  //               value={
  //                 loadingData && !stats ? "…" : formatINR(stats?.totalMargin ?? 0)
  //               }
  //               hint="Extra above MRP (all orders)"
  //             />
  //             <AgentStatsCard
  //               label="You earned (80%)"
  //               value={
  //                 loadingData && !stats
  //                   ? "…"
  //                   : formatINR(stats?.totalEarnings ?? 0)
  //               }
  //               hint="Your share of margin"
  //             />
  //             <AgentStatsCard
  //               label="You received"
  //               value={
  //                 loadingData && !stats
  //                   ? "…"
  //                   : formatINR(stats?.totalReceived ?? 0)
  //               }
  //               hint="Admin marked order payout Paid"
  //             />
  //             <AgentStatsCard
  //               label="Pending payout"
  //               value={
  //                 loadingData && !stats
  //                   ? "…"
  //                   : formatINR(stats?.totalPending ?? 0)
  //               }
  //               hint="Not paid by admin yet"
  //             />
  //           </div>

  //           <p className="mt-3 text-xs text-muted-foreground">
  //             Of every extra amount above MRP, <strong>80%</strong> is your
  //             earning and <strong>20%</strong> goes to Arrheniux. Received +
  //             Pending should equal You earned (80%).
  //           </p>

  //           {/* Optional check row */}
  //           {!loadingData && stats && (
  //             <div className="mt-2 rounded-lg border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
  //               Arrheniux share (20%):{" "}
  //               <span className="font-medium text-foreground">
  //                 {formatINR(stats.totalPlatformEarnings ?? 0)}
  //               </span>
  //               {" · "}
  //               Check: earned {formatINR(stats.totalEarnings ?? 0)} = received{" "}
  //               {formatINR(stats.totalReceived ?? 0)} + pending{" "}
  //               {formatINR(stats.totalPending ?? 0)}
  //             </div>
  //           )}
            
  //           {/* Quick actions */}
  //           <div className="mt-4 grid gap-3 sm:grid-cols-2">
  //             <Link
  //               to="/agent-panel/products"
  //               className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
  //             >
  //               <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
  //                 <Package className="h-5 w-5" />
  //               </div>
  //               <div>
  //                 <div className="text-sm font-semibold">Products & prices</div>
  //                 <div className="text-xs text-muted-foreground">
  //                   {stats?.pricedProductCount ?? 0} products with custom prices
  //                 </div>
  //               </div>
  //             </Link>

  //             <Link
  //               to="/agent-panel/share"
  //               className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
  //             >
  //               <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
  //                 <Share2 className="h-5 w-5" />
  //               </div>
  //               <div>
  //                 <div className="text-sm font-semibold">Share My Store</div>
  //                 <div className="text-xs text-muted-foreground truncate max-w-[220px]">
  //                   /agent/{agent.shareToken?.slice(0, 10)}…
  //                 </div>
  //               </div>
  //             </Link>
  //           </div>

  //           {/* Recent orders */}
  //           <section className="mt-6">
  //             <div className="mb-3 flex items-center justify-between">
  //               <h3 className="text-sm font-semibold">Recent orders</h3>
  //               <span className="text-xs text-muted-foreground">Latest 10</span>
  //             </div>

  //             <div className="w-full min-w-0 overflow-x-auto rounded-xl border -mx-0">
  // <table className="w-full min-w-[720px] text-left text-sm">
  //                 <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
  //                   <tr>
  //                     <th className="px-3 py-2 font-medium">Order</th>
  //                     <th className="px-3 py-2 font-medium">Customer</th>
  //                     <th className="px-3 py-2 font-medium">Product</th>
  //                     <th className="px-3 py-2 font-medium">Qty</th>
  //                     <th className="px-3 py-2 font-medium">Total</th>
  //                     <th className="px-3 py-2 font-medium">Earning</th>
  //                     <th className="px-3 py-2 font-medium">Your payout</th>
  //                     <th className="px-3 py-2 font-medium">Status</th>
  //                     <th className="px-3 py-2 font-medium">Date</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody>
  //                   {loadingData && orders.length === 0 ? (
  //                     <tr>
  //                       <td
  //                         colSpan={8}
  //                         className="px-3 py-8 text-center text-muted-foreground"
  //                       >
  //                         Loading orders…
  //                       </td>
  //                     </tr>
  //                   ) : orders.length === 0 ? (
  //                     <tr>
  //                       <td
  //                         colSpan={8}
  //                         className="px-3 py-8 text-center text-muted-foreground"
  //                       >
  //                         No sales agent orders yet. Share your store link to
  //                         get started.
  //                       </td>
  //                     </tr>
  //                   ) : (
  //                     orders.map((o) => (
  //                       <tr key={o.id} className="border-b last:border-0">
  //                         <td className="px-3 py-2 font-mono text-xs">
  //                           {o.id}
  //                         </td>
  //                         <td className="px-3 py-2">
  //                           <div className="font-medium">
  //                             {o.customer || "—"}
  //                           </div>
  //                           <div className="text-[11px] text-muted-foreground">
  //                             {o.phone || ""}
  //                           </div>
  //                         </td>
  //                         <td className="px-3 py-2">
  //                           <div className="max-w-[160px] truncate">
  //                             {o.productName}
  //                           </div>
  //                           <div className="text-[11px] font-mono text-muted-foreground">
  //                             {o.productCode}
  //                           </div>
  //                         </td>
  //                         <td className="px-3 py-2 tabular-nums">{o.qty}</td>
  //                         <td className="px-3 py-2 tabular-nums">
  //                           {formatINR(o.totalAmount)}
  //                         </td>
  //                         <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-400">
  //                           {formatINR(o.agentEarning ?? 0)}
  //                         </td>
  //                         <td className="px-3 py-2">
  //                           <span
  //                             className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
  //                               o.agentPayoutStatus === "Paid"
  //                                 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
  //                                 : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
  //                             }`}
  //                           >
  //                             {o.agentPayoutStatus === "Paid"
  //                               ? "Received"
  //                               : "Pending"}
  //                           </span>
  //                         </td>
  //                         <td className="px-3 py-2">
  //                           <span
  //                             className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(o.status)}`}
  //                           >
  //                             {o.status}
  //                           </span>
  //                         </td>
  //                         <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
  //                           {o.date}
  //                         </td>
  //                       </tr>
  //                     ))
  //                   )}
  //                 </tbody>
  //               </table>
  //             </div>
  //                           {ordersTotalPages > 1 && (
  //               <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
  //                 <p className="text-xs text-muted-foreground">
  //                   Page {ordersPage} of {ordersTotalPages}
  //                 </p>
  //                 <div className="flex gap-2">
  //                   <button
  //                     type="button"
  //                     disabled={ordersPage <= 1 || loadingData}
  //                     onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
  //                     className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
  //                   >
  //                     Previous
  //                   </button>
  //                   <button
  //                     type="button"
  //                     disabled={ordersPage >= ordersTotalPages || loadingData}
  //                     onClick={() =>
  //                       setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))
  //                     }
  //                     className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
  //                   >
  //                     Next
  //                   </button>
  //                 </div>
  //               </div>
  //             )}
  //           </section>
  //         </main>
  //       </div>
  //     {/* </AgentPanelLayout> */}
  //   </div>
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
      <div className="min-w-0 w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Overview of your store performance and recent orders
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load(agent.id, ordersPage)}
            disabled={loadingData}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {/* KPI cards — volume */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AgentStatsCard
            label="Total Orders"
            value={loadingData && !stats ? "…" : (stats?.totalOrders ?? 0)}
          />
          <AgentStatsCard
            label="Total Customers"
            value={loadingData && !stats ? "…" : (stats?.totalCustomers ?? 0)}
          />
          <AgentStatsCard
            label="Total Sales"
            value={
              loadingData && !stats ? "…" : formatINR(stats?.totalSales ?? 0)
            }
            hint="What customers paid"
          />
        </div>

        {/* KPI cards — earnings */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AgentStatsCard
            label="Total margin"
            value={
              loadingData && !stats ? "…" : formatINR(stats?.totalMargin ?? 0)
            }
            hint="Extra above MRP (all orders)"
          />
          <AgentStatsCard
            label="You earned (80%)"
            value={
              loadingData && !stats
                ? "…"
                : formatINR(stats?.totalEarnings ?? 0)
            }
            hint="Your share of margin"
          />
          <AgentStatsCard
            label="You received"
            value={
              loadingData && !stats
                ? "…"
                : formatINR(stats?.totalReceived ?? 0)
            }
            hint="Admin marked order payout Paid"
          />
          <AgentStatsCard
            label="Pending payout"
            value={
              loadingData && !stats
                ? "…"
                : formatINR(stats?.totalPending ?? 0)
            }
            hint="Not paid by admin yet"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Of every extra amount above MRP, <strong>80%</strong> is your earning
          and <strong>20%</strong> goes to Arrheniux. Received + Pending should
          equal You earned (80%).
        </p>

        {!loadingData && stats && (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            Arrheniux share (20%):{" "}
            <span className="font-medium text-foreground">
              {formatINR(stats.totalPlatformEarnings ?? 0)}
            </span>
            {" · "}
            Check: earned {formatINR(stats.totalEarnings ?? 0)} = received{" "}
            {formatINR(stats.totalReceived ?? 0)} + pending{" "}
            {formatINR(stats.totalPending ?? 0)}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/agent-panel/products"
            className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Products & prices</div>
              <div className="text-xs text-muted-foreground">
                {stats?.pricedProductCount ?? 0} products with custom prices
              </div>
            </div>
          </Link>

          <Link
            to="/agent-panel/share"
            className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Share My Store</div>
              <div className="truncate text-xs text-muted-foreground">
                /agent/{agent.shareToken?.slice(0, 10)}…
              </div>
            </div>
          </Link>
        </div>

        {/* Recent orders */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent orders</h3>
            <span className="text-xs text-muted-foreground">
              Page {ordersPage} · 10 per page
            </span>
          </div>

          <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Order</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Earning</th>
                  <th className="px-3 py-2 font-medium">Your payout</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingData && orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      Loading orders…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No sales agent orders yet. Share your store link to get
                      started.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{o.customer || "—"}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {o.phone || ""}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="max-w-[160px] truncate">
                          {o.productName}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {o.productCode}
                        </div>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{o.qty}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatINR(o.totalAmount)}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-400">
                        {formatINR(o.agentEarning ?? 0)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            o.agentPayoutStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          }`}
                        >
                          {o.agentPayoutStatus === "Paid"
                            ? "Received"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass(o.status)}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                        {o.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {ordersTotalPages > 1 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Page {ordersPage} of {ordersTotalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={ordersPage <= 1 || loadingData}
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={ordersPage >= ordersTotalPages || loadingData}
                  onClick={() =>
                    setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))
                  }
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AgentPanelLayout>
  );
}
