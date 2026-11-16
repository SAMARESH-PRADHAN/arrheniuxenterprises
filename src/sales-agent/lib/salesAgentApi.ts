import { BASE, ApiError } from "@/lib/api";
import type {
  SalesAgent,
  SalesAgentLoginResponse,
  SalesAgentStats,
  SalesAgentProduct,
  SalesAgentOrder,
  Paginated,
} from "../types/salesAgent";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/${path.replace(/^\//, "")}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const message =
      (body as { error?: string; message?: string }).error ||
      (body as { message?: string }).message ||
      "Request failed";
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export function salesAgentLogin(code: string) {
  return request<SalesAgentLoginResponse>("sales-agents/login", {
    method: "POST",
    body: JSON.stringify({ code: code.trim() }),
  });
}

export function fetchSalesAgent(id: string) {
  return request<SalesAgent>(`sales-agents/${id}`);
}

export function fetchSalesAgentStats(id: string) {
  return request<SalesAgentStats>(`sales-agents/${id}/stats`);
}

export function fetchSalesAgentOrders(
  id: string,
  params?: { page?: number; limit?: number },
) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return request<Paginated<SalesAgentOrder>>(
    `sales-agents/${id}/orders${q ? `?${q}` : ""}`,
  );
}

export function fetchSalesAgentProducts(
  id: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    subCategory?: string;
  },
) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.category) qs.set("category", params.category);
  if (params?.type) qs.set("type", params.type);
  if (params?.subCategory) qs.set("subCategory", params.subCategory);
  const q = qs.toString();
  return request<Paginated<SalesAgentProduct>>(
    `sales-agents/${id}/products${q ? `?${q}` : ""}`,
  );
}

export function updateSalesAgentProductPrice(
  agentId: string,
  productId: string,
  agentPrice: number,
) {
  return request(`sales-agents/${agentId}/products/${productId}/price`, {
    method: "PUT",
    body: JSON.stringify({ agentPrice }),
  });
}

export function resetSalesAgentProductPrice(agentId: string, productId: string) {
  return request(`sales-agents/${agentId}/products/${productId}/price`, {
    method: "DELETE",
  });
}

/** Public storefront by share token (no login) */
export function fetchPublicSalesAgent(shareToken: string) {
  return request<{ id: string; name: string; shareToken: string; status: string }>(
    `sales-agents/public/${encodeURIComponent(shareToken)}`,
  );
}

export function fetchPublicSalesAgentProducts(
  shareToken: string,
  params?: { page?: number; limit?: number; category?: string; type?: string },
) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.category) qs.set("category", params.category);
  if (params?.type) qs.set("type", params.type);
  const q = qs.toString();
  return request<Paginated<SalesAgentProduct> & { salesAgentId?: string }>(
    `sales-agents/public/${encodeURIComponent(shareToken)}/products${q ? `?${q}` : ""}`,
  );
}

export function buildShareStoreUrl(shareToken: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://arrheniux.com";
  return `${origin}/agent/${shareToken}`;
}