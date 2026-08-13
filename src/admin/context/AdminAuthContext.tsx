import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSession, clearSession, login as storeLogin, User } from "@/lib/authStore";

type AdminAuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const s = getSession();
    if (s && s.role === "admin") setUser(s);
  }, []);

  const login = (email: string, password: string) => {
    const r = storeLogin(email, password);
    if (!r.ok || !r.user) return { ok: false, error: r.error || "Login failed" };
    if (r.user.role !== "admin") return { ok: false, error: "This account is not an admin" };
    setUser(r.user);
    return { ok: true };
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
