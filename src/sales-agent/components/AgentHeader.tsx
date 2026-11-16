// import { LogOut } from "lucide-react";
// import type { SalesAgent } from "../types/salesAgent";

// type Props = {
//   agent: SalesAgent;
//   onLogout: () => void;
//   title?: string;
// };

// export function AgentHeader({ agent, onLogout, title = "Sales Agent Panel" }: Props) {
//   return (
//     <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
//       <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
//         <div className="min-w-0">
//           <div className="truncate text-sm font-semibold">{title}</div>
//           <div className="truncate text-xs text-muted-foreground">
//             {agent.name} · <span className="font-mono">{agent.code}</span>
//           </div>
//         </div>
//         <button
//           type="button"
//           onClick={onLogout}
//           className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
//         >
//           <LogOut className="h-3.5 w-3.5" />
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// }


import { LogOut, ShieldCheck, UserRound, Sparkles } from "lucide-react";
import type { SalesAgent } from "../types/salesAgent";

type Props = {
  agent: SalesAgent;
  onLogout: () => void;
  title?: string;
};

export function AgentHeader({
  agent,
  onLogout,
  title = "Sales Agent Panel",
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-200/70 bg-white/90 shadow-sm shadow-emerald-900/5 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-black/20">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-6">

        {/* Left: Brand and Page Title */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-600/20 ring-1 ring-white/40 dark:shadow-emerald-950/50">
            <Sparkles className="h-5 w-5" />
            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white/20 blur-sm" />
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-black tracking-tight text-slate-900 dark:text-white sm:text-base">
                {title}
              </h1>
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 sm:inline-flex dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                Portal
              </span>
            </div>

            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
              Manage your store and grow your business
            </p>
          </div>
        </div>

        {/* Right: Agent Information and Logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Agent Profile */}
          <div className="hidden items-center gap-2.5 rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 sm:flex dark:border-emerald-500/20 dark:from-slate-800 dark:to-slate-800/70">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <UserRound className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="max-w-[130px] truncate text-xs font-extrabold text-slate-800 dark:text-slate-100">
                {agent.name}
              </p>
              <p className="font-mono text-[10px] font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
                {agent.code}
              </p>
            </div>
          </div>

          {/* Mobile Agent Name */}
          <div className="max-w-[105px] min-w-0 sm:hidden">
            <p className="truncate text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
              {agent.name}
            </p>
            <p className="truncate font-mono text-[9px] text-emerald-700 dark:text-emerald-300">
              {agent.code}
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}

className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 px-3 text-xs font-extrabold text-rose-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400 hover:from-rose-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:shadow-rose-500/20 active:translate-y-0 dark:border-rose-500/50 dark:bg-gradient-to-r dark:from-rose-950 dark:to-red-950 dark:text-rose-300 dark:shadow-lg dark:shadow-rose-950/30 dark:hover:border-rose-400 dark:hover:from-rose-600 dark:hover:to-red-600 dark:hover:text-white dark:hover:shadow-rose-500/25 sm:px-4"
          >
            <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
