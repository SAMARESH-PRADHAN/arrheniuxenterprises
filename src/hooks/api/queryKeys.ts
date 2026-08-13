export const queryKeys = {
  products: (filters?: { status?: string; category?: string; type?: string }) =>
    ["products", filters ?? {}] as const,
  product: (id: string) => ["product", id] as const,
  b2bProducts: ["b2b-products"] as const,
  b2bProduct: (id: string) => ["b2b-product", id] as const,
  newCollection: ["new-collection"] as const,
  welcomeKits: ["welcome-kits"] as const,
  reviews: (status?: string) => ["reviews", status ?? "all"] as const,
  productReviews: (productId: string) => ["reviews", "product", productId] as const,
  orders: (customerId?: string) => ["orders", customerId ?? "all"] as const,
  customers: ["customers"] as const,
  customer: (id: string) => ["customer", id] as const,
  agents: ["agents"] as const,
};
