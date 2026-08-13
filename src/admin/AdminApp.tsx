import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Package, Tag, MessageSquare, Settings as SettingsIcon, Users, LogOut } from "lucide-react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminInquiries from "./pages/AdminInquiries";
import AdminSettings from "./pages/AdminSettings";
import AdminCustomers from "./pages/AdminCustomers";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAdminAuth();
  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <aside className="w-64 shrink-0 bg-zinc-950 text-zinc-100 min-h-screen p-5 flex flex-col border-r border-zinc-800">
      <div className="mb-8 pb-5 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
          Arrhenius
        </h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-0.5">Admin Console</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => {
          const active = l.end ? location.pathname === l.to : location.pathname.startsWith(l.to);
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/20"
                  : "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        {user && (
          <div className="px-2 mb-3">
            <p className="text-xs text-zinc-500">Signed in as</p>
            <p className="text-sm text-zinc-200 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

const ProtectedShell = () => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/customers" element={<AdminCustomers />} />
          <Route path="/inquiries" element={<AdminInquiries />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminApp = () => (
  <AdminAuthProvider>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  </AdminAuthProvider>
);

export default AdminApp;
