import { LayoutDashboard, Package, Share2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/agent-panel", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/agent-panel/products", label: "Products & Prices", icon: Package },
  { to: "/agent-panel/share", label: "Share Store", icon: Share2 },
];

export function AgentSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden w-56 shrink-0 border-r bg-muted/20 p-3 md:block">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}