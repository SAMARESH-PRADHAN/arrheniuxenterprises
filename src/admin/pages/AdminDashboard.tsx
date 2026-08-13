import { useMemo } from "react";
import { Users, Eye, Package, MessageSquare, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { getUsers, getVisits, getProducts } from "@/lib/authStore";

const fmtDay = (d: Date) => d.toISOString().slice(5, 10); // MM-DD

const AdminDashboard = () => {
  const { users, visits, products, traffic, signupSeries, byCategory } = useMemo(() => {
    const users = getUsers().filter((u) => u.role === "customer");
    const visits = getVisits();
    const products = getProducts();

    // Last 14 days series
    const days: { day: string; visits: number; signups: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        day: fmtDay(d),
        visits: visits.filter((v) => v.at.slice(0, 10) === key).length,
        signups: users.filter((u) => u.createdAt.slice(0, 10) === key).length,
      });
    }

    // Products per category
    const catMap: Record<string, number> = {};
    products.forEach((p) => (catMap[p.category] = (catMap[p.category] || 0) + 1));
    const byCategory = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    return { users, visits, products, traffic: days, signupSeries: days, byCategory };
  }, []);

  const totalVisits = visits.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Real-time overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Visits" value={totalVisits} icon={Eye} accent="from-blue-400 to-blue-600" />
        <Stat label="Customers" value={users.length} icon={Users} accent="from-emerald-400 to-emerald-600" />
        <Stat label="Products" value={products.length} icon={Package} accent="from-amber-400 to-amber-600" />
        <Stat label="Inquiries" value={7} icon={MessageSquare} accent="from-violet-400 to-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Website Traffic" subtitle="Visits over the last 14 days" icon={TrendingUp} />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={traffic} margin={{ left: -20, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#e4e4e7" }} />
              <Area type="monotone" dataKey="visits" stroke="#fbbf24" strokeWidth={2} fill="url(#gv)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="New Signups" subtitle="Last 14 days" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={signupSeries} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#e4e4e7" }} />
              <Bar dataKey="signups" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardHeader title="Products by Category" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byCategory} margin={{ left: -20, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#e4e4e7" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {byCategory.map((_, i) => (
                <Cell key={i} fill={["#fbbf24", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316"][i % 7]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

const Stat = ({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent: string }) => (
  <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
    <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-xl`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="text-3xl font-bold text-zinc-100 mt-2">{value}</p>
      </div>
      <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center`}>
        <Icon className="h-4 w-4 text-zinc-950" />
      </div>
    </div>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: React.ElementType }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="font-semibold text-zinc-100">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
    </div>
    {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
  </div>
);

export default AdminDashboard;
