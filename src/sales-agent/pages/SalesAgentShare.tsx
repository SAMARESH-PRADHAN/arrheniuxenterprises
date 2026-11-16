

import { Navigate, useNavigate } from "react-router-dom";
import { AgentHeader } from "../components/AgentHeader";
import { AgentSidebar } from "../components/AgentSidebar";
import { ShareStoreButton } from "../components/ShareStoreButton";
import { useSalesAgent } from "../hooks/useSalesAgent";
import { AgentPanelLayout } from "../components/AgentPanelLayout";

export default function SalesAgentShare() {
  const { agent, isAuthenticated, loading, logout } = useSalesAgent();
  const navigate = useNavigate();

  if (loading) {
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
  //     title="Share My Store"
  //     onLogout={() => {
  //       logout();
  //       navigate("/agent-panel/login");
  //     }}
  //   >
  //     <div className="min-w-0 w-full max-w-lg space-y-4">
  //       <div>
  //         <h2 className="text-lg font-semibold">Share My Store</h2>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           Send this public link to customers. They shop the normal Arrheniux
  //           site with{" "}
  //           <span className="font-medium">your agent prices</span>. Payments
  //           still go to Arrheniux.
  //         </p>
  //       </div>

  //       <div className="rounded-2xl border p-4">
  //         <ShareStoreButton
  //           shareToken={agent.shareToken}
  //           agentName={agent.name}
  //         />
  //       </div>

  //       <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
  //         <p className="font-semibold">Keep these separate</p>
  //         <ul className="list-disc space-y-1 pl-4">
  //           <li>
  //             <span className="font-medium">Agent Code</span> ({agent.code}) —
  //             private login only. Never share with customers.
  //           </li>
  //           <li>
  //             <span className="font-medium">Share Token / Store link</span> —
  //             public. Safe for WhatsApp, Instagram, etc.
  //           </li>
  //         </ul>
  //       </div>
  //     </div>
  //   </AgentPanelLayout>
  // );


return (
  <AgentPanelLayout
    agent={agent}
    title="Share My Store"
    onLogout={() => {
      logout();
      navigate("/agent-panel/login");
    }}
  >
    <div className="min-w-0 w-full max-w-3xl space-y-6">

      {/* Premium Hero Section */}
      <div className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#075985] p-5 text-white shadow-xl shadow-emerald-900/20 sm:p-7">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 -z-10 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
            YOUR PERSONAL STORE
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Share Your Store
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/90 sm:text-base">
            Your business, your customers, your earnings. Share your personal
            store link and let customers shop with your agent prices.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80">
                Store owner
              </p>
              <p className="mt-0.5 max-w-[220px] truncate text-sm font-bold text-white">
                {agent.name}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-100/80">
                Store status
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Ready to share
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Store Card */}
      <div className="overflow-hidden rounded-3xl border border-emerald-200/70 bg-white shadow-lg shadow-emerald-900/5 dark:border-emerald-900/60 dark:bg-slate-950">
        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-5 py-4 dark:border-slate-800 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-slate-900 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-xl text-white shadow-md shadow-emerald-600/20">
              ↗
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                Your Public Store Link
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                Share your store with customers anywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:p-4">
            <p className="text-sm leading-6 text-emerald-950 dark:text-emerald-100">
              Customers visiting your link will shop on the normal Arrheniux
              website and see your assigned agent prices.
            </p>
          </div>

          <ShareStoreButton
            shareToken={agent.shareToken}
            agentName={agent.name}
          />
        </div>
      </div>

      {/* Sharing Guide */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Public Link */}
        <div className="group relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 shadow-md shadow-cyan-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-900/10 dark:border-cyan-900/60 dark:from-cyan-950/40 dark:via-slate-950 dark:to-blue-950/30 sm:p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl transition-all group-hover:bg-cyan-400/20" />

          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-xl text-white shadow-lg shadow-cyan-600/20">
              🌐
            </div>

            <div className="mb-2 inline-flex rounded-full bg-cyan-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200">
              Public information
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Store Link / Share Token
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This is your public store link. You can safely share it with
              customers through:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {["WhatsApp", "Instagram", "Facebook"].map((platform) => (
                <span
                  key={platform}
                  className="rounded-lg border border-cyan-200 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-200"
                >
                  {platform}
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-cyan-100/80 p-3 text-xs font-semibold text-cyan-900 dark:bg-cyan-950/60 dark:text-cyan-200">
              ✓ Safe to share with customers
            </div>
          </div>
        </div>

        {/* Private Agent Code */}
        <div className="group relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 shadow-md shadow-rose-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-900/10 dark:border-rose-900/60 dark:from-rose-950/40 dark:via-slate-950 dark:to-orange-950/30 sm:p-5">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-400/10 blur-2xl transition-all group-hover:bg-rose-400/20" />

          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-orange-600 text-xl text-white shadow-lg shadow-rose-600/20">
              🔒
            </div>

            <div className="mb-2 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
              Private information
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Agent Code
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Your agent code is used for your private login and account access.
              Keep it confidential.
            </p>

            <div className="mt-4 rounded-xl border border-rose-200 bg-white/80 p-3 dark:border-rose-900/60 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
                Your agent code
              </p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900 dark:text-white">
                {agent.code}
              </p>
            </div>

            <div className="mt-3 rounded-xl bg-rose-100/80 p-3 text-xs font-semibold text-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              ⚠ Never share this with customers
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 p-4 shadow-md shadow-amber-900/5 dark:border-amber-900/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/50 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg text-white shadow-md shadow-amber-600/20">
            !
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-200 sm:text-base">
              Important: Keep these separate
            </h3>

            <p className="mt-1 text-xs leading-5 text-amber-900/90 dark:text-amber-100/80 sm:text-sm">
              Your public store link and private agent login code serve
              different purposes. Never share your login credentials with
              customers.
            </p>

            <ul className="mt-3 space-y-2 text-xs text-amber-950 dark:text-amber-100 sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-rose-600 dark:text-rose-400">
                  ✕
                </span>
                <span>
                  <strong>Agent Code ({agent.code})</strong> — private login
                  only. Never share with customers.
                </span>
              </li>

              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                  ✓
                </span>
                <span>
                  <strong>Share Token / Store Link</strong> — public. Safe for
                  WhatsApp, Instagram, and other customer channels.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg text-white shadow-md shadow-blue-600/20">
          ₹
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200">
            Payments are handled by Arrheniux
          </h3>
          <p className="mt-1 text-xs leading-5 text-blue-900/80 dark:text-blue-100/70 sm:text-sm">
            Customers can shop using your agent prices, but all payments still
            go directly to Arrheniux.
          </p>
        </div>
      </div>

    </div>
  </AgentPanelLayout>
);

}