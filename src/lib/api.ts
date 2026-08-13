export const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export function fetchSampleOrders() {
  return request<ApiOrder[]>("sample-orders");
}
export function loginWithGoogle(idToken: string) {
  return request<ApiCustomer>("customers/google-login", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError((body as { error?: string }).error ?? "Request failed", res.status);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (data && typeof data === "object" && !Array.isArray(data) && Array.isArray((data as any).data)) {
    return (data as any).data as T;
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Response types (match brandflow-admin backend mappers)
// ---------------------------------------------------------------------------

export type ApiProduct = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: "Regular" | "Premium" | "Others";
  subCategory: string;
  material: string;
  description: string;
  overview?: string;
  specifications: string[];
  designGuidelines: string[];
  washCare: string[];
  samplePrice: number;
  originalPrice: number;
  status: "Active" | "Inactive";
  image: string;
  images: string[];
  stock: number;
  orders: number;
  rating: number;
  visibility: "Category" | "Bulk" | "Both";
  colors: Array<string | { name: string; hex: string }>;
  createdAt: string;
  kitItems?: Array<{ name: string; price: number }>; // ADD THIS
};

export type ApiB2BProduct = {
  id: string;
  code: string;
  name: string;
  subCategory: string;
  material: string;
  description: string;
  overview?: string;
  specifications: string[];
  designGuidelines: string[];
  washCare: string[];
  samplePrice: number;
  originalPrice: number;
  status: "Active" | "Inactive";
  image: string;
  images: string[];
  createdAt: string;
};

export type ApiNewCollectionProduct = {
  id: string;
  code: string;
  name: string;
  material: string;
  description: string;
  overview?: string;
  specifications: string[];
  designGuidelines: string[];
  washCare: string[];
  samplePrice: number;
  originalPrice: number;
  status: "Active" | "Inactive";
  image: string;
  images: string[];
  createdAt: string;
};

export type ApiWelcomeKitItem = {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
  image: string;
  images: string[];
  description: string;
};

export type ApiCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  joinDate: string;
  status: "Active" | "Inactive";
};

export type ApiAgent = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
  joinDate: string;
};

export type ApiOrderStatus = "Placed" | "Confirmed" | "In Production" | "Shipped" | "Delivered";
export type ApiOrderType = "Normal" | "Bulk" | "B2B" | "New Collection";
export type ApiPaymentStatus = "Paid" | "Pending" | "Partial" | "Failed" | "Refunded";
export type ApiPaymentMethod = "UPI" | "Credit Card" | "Net Banking" | "COD" | "Wallet";

export type ApiOrder = {
  id: string;
  customerId: string | null;
  customer: string;
  phone: string;
  email: string;
  address: string;
  productId: string | null;
  productCode: string;
  productName: string;
  category: string;
  productType: string;
  subCategory: string;
  material: string;
  description: string;
  printType: string;
  printLocation: string;
  uploadedLogo: string;
  sizes: Record<string, number>;
  qty: number;
  unitPrice: number;
  printingPrice?: number;
  gstPct: number;
  shipping: number;
  type: ApiOrderType;
  status: ApiOrderStatus;
  paymentStatus: ApiPaymentStatus;
  paymentMethod: ApiPaymentMethod;
  isSample: boolean;
  date: string;
  discountPct: number;
  discountAmt: number;
  totalAmount: number;
  paidAmount: number;
  timeline: Array<{ status: ApiOrderStatus; at: string }>;
};

export type ApiPayment = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: ApiPaymentMethod;
  status: ApiPaymentStatus;
  date: string;
};

export type ApiReview = {
  id: string;
  customer: string;
  product: string;
  productId: string | null;
  orderId: string | null;
  rating: number;
  comment: string;
  image: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
  verified: boolean;
};

export type ApiAgentVisit = {
  id: string;
  agentId: string;
  agentName: string;
  agentCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  address: string;
  city: string;
  gstNumber: string;
  visitDate: string;
  nextFollowUp: string;
  outcome: "Interested" | "Follow-up" | "Not Interested" | "Converted" | "Sample Requested";
  requirement: string;
  notes: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export type ProductFilters = {
  status?: string;
  category?: string;
  type?: string;
};

export type CreateCustomerInput = {
  id?: string;
  name: string;
  phone?: string;
  email: string;
  address?: string;
  password?: string;
};

export type CreateOrderInput = {
  id?: string;
  customerId?: string | null;
  customer: string;
  phone: string;
  email: string;
  address?: string;
  productId?: string | null;
  productCode?: string;
  productName: string;
  category?: string;
  productType?: string;
  subCategory?: string;
  material?: string;
  description?: string;
  printType?: string;
  printLocation?: string;
  uploadedLogo?: string;
  sizes?: Record<string, number>;
  qty: number;
  unitPrice: number;
  printingPrice?: number;
  gstPct?: number;
  shipping?: number;
  type?: ApiOrderType;
  status?: ApiOrderStatus;
  paymentStatus?: ApiPaymentStatus;
  paymentMethod?: ApiPaymentMethod;
  date?: string;
   discountPct?: number;
  discountAmt?: number;
  total?: number;
  paid?: number;
  timeline?: Array<{ status: ApiOrderStatus; at: string }>;
};

export type CreatePaymentInput = {
  id?: string;
  orderId: string;
  customer: string;
  amount: number;
  method?: ApiPaymentMethod;
  status?: ApiPaymentStatus;
  date?: string;
};

export type CreateReviewInput = {
  id?: string;
  customer: string;
  product?: string;
  productId?: string | null;
  orderId?: string | null;
  rating: number;
  comment: string;
  image?: string;
  date?: string;
  status?: "Approved" | "Pending" | "Rejected";
  verified?: boolean;
};

export type CreateAgentInput = {
  id?: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  status?: "Active" | "Inactive";
  joinDate?: string;
};

export type CreateAgentVisitInput = {
  id?: string;
  agentId: string;
  agentName?: string;
  agentCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  visitDate?: string;
  nextFollowUp?: string | null;
  outcome?: ApiAgentVisit["outcome"];
  requirement?: string;
  notes?: string;
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function fetchProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  const qs = params.toString();
  return request<ApiProduct[]>(`products${qs ? `?${qs}` : ""}`);
}

export function fetchProduct(id: string) {
  return request<ApiProduct>(`products/${id}`);
}

export function fetchB2BProducts() {
  return request<ApiB2BProduct[]>("b2b-products");
}

export function fetchB2BProduct(id: string) {
  return request<ApiB2BProduct>(`b2b-products/${id}`);
}

export function fetchNewCollectionProducts() {
  return request<ApiNewCollectionProduct[]>("new-collection");
}

export function fetchNewCollectionProduct(id: string) {
  return request<ApiNewCollectionProduct>(`new-collection/${id}`);
}

export function fetchWelcomeKitItems() {
  return request<ApiWelcomeKitItem[]>("welcome-kits");
}

/** Resolve a product id across catalog, B2B, and new-collection tables. */
export async function fetchAnyProduct(id: string): Promise<
  | { source: "products"; product: ApiProduct }
  | { source: "b2b"; product: ApiB2BProduct }
  | { source: "new-collection"; product: ApiNewCollectionProduct }
> {
  const prefix = id.split("-")[0]?.toUpperCase();
  if (prefix === "B2B") {
    return { source: "b2b", product: await fetchB2BProduct(id) };
  }
  if (prefix === "NEW") {
    return { source: "new-collection", product: await fetchNewCollectionProduct(id) };
  }
  try {
    return { source: "products", product: await fetchProduct(id) };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      try {
        return { source: "b2b", product: await fetchB2BProduct(id) };
      } catch {
        return { source: "new-collection", product: await fetchNewCollectionProduct(id) };
      }
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export function fetchCustomers(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<ApiCustomer[]>(`customers${qs}`);
}

export function fetchCustomer(id: string) {
  return request<ApiCustomer>(`customers/${id}`);
}

export function createCustomer(body: CreateCustomerInput) {
  return request<ApiCustomer>("customers", { method: "POST", body: JSON.stringify(body) });
}
export function loginCustomer(email: string, password: string) {
  return request<ApiCustomer>("customers/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---------------------------------------------------------------------------
// Agents & visits
// ---------------------------------------------------------------------------

export function fetchAgents() {
  return request<ApiAgent[]>("agents");
}

export function createAgent(body: CreateAgentInput) {
  return request<ApiAgent>("agents", { method: "POST", body: JSON.stringify(body) });
}

export function createAgentVisit(body: CreateAgentVisitInput) {
  return request<ApiAgentVisit>("agent-visits", { method: "POST", body: JSON.stringify(body) });
}

// ---------------------------------------------------------------------------
// Orders & payments
// ---------------------------------------------------------------------------

export function fetchOrders(filters?: { type?: string; status?: string; customerId?: string }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  return request<ApiOrder[]>(`orders${qs ? `?${qs}` : ""}`);
}

export function fetchOrder(id: string) {
  return request<ApiOrder>(`orders/${id}`);
}

export function createOrder(body: CreateOrderInput) {
  return request<ApiOrder>("orders", { method: "POST", body: JSON.stringify(body) });
}

export function createSampleOrder(body: CreateOrderInput) {
  return request<ApiOrder>("sample-orders", { method: "POST", body: JSON.stringify(body) });
}

export function createPayment(body: CreatePaymentInput) {
  return request<ApiPayment>("payments", { method: "POST", body: JSON.stringify(body) });
}
export function patchCustomer(
  id: string,
  body: Partial<Pick<ApiCustomer, "address" | "totalOrders" | "totalSpend">>,
) {
  return request<ApiCustomer>(`customers/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function patchOrder(
  id: string,
  body: Partial<CreateOrderInput> & { paymentStatus?: ApiPaymentStatus },
) {
  return request<ApiOrder>(`orders/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export function fetchReviews(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<ApiReview[]>(`reviews${qs}`);
}

export function createReview(body: CreateReviewInput) {
  return request<ApiReview>("reviews", { method: "POST", body: JSON.stringify(body) });
}
