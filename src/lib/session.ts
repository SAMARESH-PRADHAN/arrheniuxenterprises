import type { ApiCustomer } from "@/lib/api";

const SESSION_KEY = "arr_api_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
};

export type AuthResult = { ok: boolean; user?: SessionUser; error?: string };

export function customerToSessionUser(c: ApiCustomer): SessionUser {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    role: "customer",
  };
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}
