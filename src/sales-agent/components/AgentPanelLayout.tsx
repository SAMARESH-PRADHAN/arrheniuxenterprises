import { useEffect, ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Share2,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import type { SalesAgent } from "../types/salesAgent";

const NAV = [
  { to: "/agent-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/agent-panel/products", label: "Products", icon: Package },
  { to: "/agent-panel/share", label: "Share Store", icon: Share2 },
];

type Props = {
  agent: SalesAgent;
  title?: string;
  onLogout: () => void;
  children: ReactNode;
};

export function AgentPanelLayout({
  agent,
  title = "Sales Agent Panel",
  onLogout,
  children,
}: Props) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (localStorage.getItem("arr_agent_theme") ?? "light") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("arr_agent_theme", dark ? "dark" : "light");
  }, [dark]);

  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = (to: string, end?: boolean) => {
    const active = end ? pathname === to : pathname.startsWith(to);
    return `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      active ? "bg-emerald-600 text-white" : "text-foreground/80 hover:bg-muted"
    }`;
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={navLinkClass(item.to, item.end)}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

//   return (
//     <div className="flex min-h-screen bg-background">
//       {/* Desktop sidebar — fixed, full height, no page scroll */}
//       <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 border-r bg-muted/20">
//         <div className="border-b px-4 py-4">
//   <div className="flex items-center gap-2">
//     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1">
//       <img
//         src="/arrhenius-logo.avif"
//         alt="Arrheniux"
//         className="h-full w-full object-contain"
//       />
//     </div>

//     <span className="font-display text-lg tracking-wider text-foreground md:text-xl">
//       ARRHENIUX
//     </span>
//   </div>
// </div>
//         <div className="flex-1 overflow-y-auto p-3">
//           <NavLinks />
//         </div>
//         <div className="border-t p-3">
//           <button
//             type="button"
//             onClick={onLogout}
//             className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
//           >
//             <LogOut className="h-4 w-4" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main column — offset by sidebar width on desktop */}
//       <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background">
//         {/* Mobile top bar */}
//         <header className="sticky top-0 z-40 flex h-14 min-w-0 items-center justify-between gap-2 border-b bg-background/95 px-3 backdrop-blur md:hidden">
//           <div className="min-w-0">
//             <div className="truncate text-sm font-semibold">{title}</div>
//             <div className="truncate text-[11px] text-muted-foreground">
//               {agent.name} · <span className="font-mono">{agent.code}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-1">
//             <button
//               type="button"
//               onClick={() => setDark((d) => !d)}
//               className="rounded-md border p-2"
//               aria-label="Toggle theme"
//             >
//               {dark ? (
//                 <Sun className="h-4 w-4" />
//               ) : (
//                 <Moon className="h-4 w-4" />
//               )}
//             </button>
//             <button
//               type="button"
//               className="rounded-md border p-2"
//               onClick={() => setMobileOpen((v) => !v)}
//               aria-label="Menu"
//             >
//               {mobileOpen ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Menu className="h-5 w-5" />
//               )}
//             </button>
//           </div>
//         </header>

//         {/* Mobile drawer */}
//         {mobileOpen ? (
//           <div className="border-b bg-muted/30 p-3 md:hidden">
//             <NavLinks onNavigate={() => setMobileOpen(false)} />
//             <button
//               type="button"
//               onClick={onLogout}
//               className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
//             >
//               <LogOut className="h-4 w-4" />
//               Logout
//             </button>
//           </div>
//         ) : null}

//         {/* Desktop top strip (optional thin bar) */}
//         <div className="sticky top-0 z-20 hidden items-center justify-between gap-3 border-b bg-background/95 px-6 py-3 backdrop-blur md:flex">
//           <div className="min-w-0">
//             <h1 className="truncate text-lg font-semibold">{title}</h1>
//             <p className="truncate text-xs text-muted-foreground">
//               <span className="font-medium text-foreground">{agent.name}</span>
//               {" · "}
//               <span className="font-mono">{agent.code}</span>
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={() => setDark((d) => !d)}
//             className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
//           >
//             {dark ? (
//               <Sun className="h-3.5 w-3.5" />
//             ) : (
//               <Moon className="h-3.5 w-3.5" />
//             )}
//             {dark ? "Light" : "Dark"}
//           </button>
//         </div>

//       <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
//   <div className="mx-auto w-full max-w-7xl min-w-0">{children}</div>
// </main>

//         {/* Mobile bottom nav */}
//       <nav className="sticky bottom-0 z-40 grid grid-cols-3 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
//           {NAV.map((item) => {
//             const active = item.end
//               ? pathname === item.to
//               : pathname.startsWith(item.to);
//             return (
//               <Link
//                 key={item.to}
//                 to={item.to}
//                 className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
//                   active ? "text-emerald-600" : "text-muted-foreground"
//                 }`}
//               >
//                 <item.icon className="h-5 w-5" />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>
//       </div>
//     </div>
//   );
// }

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background">
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col border-r bg-muted/20">
        <div className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1">
              <img
                src="/arrhenius-logo.avif"
                alt="Arrheniux"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-display text-lg tracking-wider text-foreground md:text-xl">
              ARRHENIUX
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main column — MUST be flex-col + pl-64 on desktop */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-3 backdrop-blur md:hidden">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{title}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {agent.name} · <span className="font-mono">{agent.code}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="rounded-md border p-2"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="rounded-md border p-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="border-b bg-muted/30 p-3 md:hidden">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}

        {/* Desktop top bar — page title + agent + theme */}
        <div className="sticky top-0 z-20 hidden items-center justify-between gap-3 border-b bg-background/95 px-6 py-3 backdrop-blur md:flex">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{agent.name}</span>
              {" · "}
              <span className="font-mono">{agent.code}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {/* Scrollable content */}
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-20 sm:p-4 md:p-6 md:pb-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>

        {/* Mobile bottom nav */}
       <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-3 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.map((item) => {
            const active = item.end
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                  active ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}