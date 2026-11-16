// import { LayoutDashboard, Package, Share2 } from "lucide-react";
// import { Link, useLocation } from "react-router-dom";

// const items = [
//   { to: "/agent-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
//   { to: "/agent-panel/products", label: "Products & Prices", icon: Package },
//   { to: "/agent-panel/share", label: "Share Store", icon: Share2 },
// ];

// export function AgentSidebar() {
//   const { pathname } = useLocation();

//   return (
//     <aside className="hidden w-56 shrink-0 border-r bg-muted/20 p-3 md:block">
//       <nav className="space-y-1">
//         {items.map((item) => {
//           const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
//           return (
//             <Link
//               key={item.to}
//               to={item.to}
//               className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
//                 active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
//               }`}
//             >
//               <item.icon className="h-4 w-4" />
//               {item.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }


import {
  LayoutDashboard,
  Package,
  Share2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  {
    to: "/agent-panel",
    label: "Dashboard",
    description: "Overview & performance",
    icon: LayoutDashboard,
    end: true,
    color: "emerald",
  },
  {
    to: "/agent-panel/products",
    label: "Products & Prices",
    description: "Manage your pricing",
    icon: Package,
    color: "violet",
  },
  {
    to: "/agent-panel/share",
    label: "Share Store",
    description: "Grow your business",
    icon: Share2,
    color: "amber",
  },
];

export function AgentSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-emerald-200/60 bg-gradient-to-b from-emerald-50 via-white to-teal-50/70 p-4 dark:border-slate-700/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:block">
      {/* Sidebar Heading */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4 text-white shadow-lg shadow-emerald-900/15 dark:border-emerald-400/20 dark:shadow-emerald-950/40">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 shadow-inner">
            <Sparkles className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide">AGENT PORTAL</p>
            <p className="text-[10px] font-medium text-white/70">
              Your business workspace
            </p>
          </div>
        </div>

        <div className="h-px bg-white/20" />

        <p className="mt-3 text-xs leading-relaxed text-white/85">
          Manage products, pricing and your store from one place.
        </p>
      </div>

      {/* Navigation Label */}
      <div className="mb-3 flex items-center justify-between px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Main Navigation
        </p>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          MENU
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2">
        {items.map((item) => {
          const active = item.end
            ? pathname === item.to
            : pathname.startsWith(item.to);

          const Icon = item.icon;

          const colorStyles = {
            emerald: {
              icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
              active: "from-emerald-500 to-teal-600 shadow-emerald-600/20",
              hover: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10",
            },
            violet: {
              icon: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
              active: "from-violet-500 to-purple-600 shadow-violet-600/20",
              hover: "group-hover:bg-violet-100 dark:group-hover:bg-violet-500/10",
            },
            amber: {
              icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
              active: "from-amber-500 to-orange-600 shadow-amber-600/20",
              hover: "group-hover:bg-amber-100 dark:group-hover:bg-amber-500/10",
            },
          };

          const colors = colorStyles[item.color as keyof typeof colorStyles];

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 transition-all duration-300 ${
                active
                  ? `border-transparent bg-gradient-to-r ${colors.active} text-white shadow-lg`
                  : "border-transparent text-slate-700 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
              }`}
            >
              {/* Active Indicator */}
              {active && (
                <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-white/90" />
              )}

              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                  active
                    ? "bg-white/20 text-white shadow-inner"
                    : `${colors.icon} ${colors.hover}`
                }`}
              >
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-xs font-extrabold ${
                    active ? "text-white" : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`mt-1 truncate text-[10px] font-medium ${
                    active
                      ? "text-white/75"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                  active
                    ? "translate-x-0 text-white"
                    : "-translate-x-1 text-slate-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-500"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Information */}
      <div className="mt-8 rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-emerald-100/80 p-4 dark:border-teal-500/20 dark:from-teal-950/50 dark:to-emerald-950/30">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-extrabold text-teal-900 dark:text-teal-200">
            Grow with Arrheniux
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-teal-800/80 dark:text-teal-300/75">
          Keep your products updated and share your store to reach more
          customers.
        </p>
      </div>
    </aside>
  );
}
