export type SalesAgentStatus = "Active" | "Inactive";

export type SalesAgent = {
  id: string;
  code: string;
  shareToken: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: SalesAgentStatus;
  joinDate: string;
  createdAt?: string;
  updatedAt?: string;
    payoutStatus?: "Pending" | "Paid";
  payoutUpdatedAt?: string | null;
};

export type SalesAgentStats = {
  agent?: SalesAgent;
  totalOrders: number;
  totalCustomers: number;
  totalSales: number;
  totalEarnings: number; // agent 80% sum
  pricedProductCount?: number;
  totalPlatformEarnings?: number; // Arrheniux 20%
  totalMargin?: number; // 80% + 20%
  totalReceived?: number; // sum agent_earning where payout = Paid
  totalPending?: number; // sum agent_earning where payout = Pending
};

export type SalesAgentProduct = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: "Regular" | "Premium" | "Others";
  subCategory: string;
  material: string;
  description: string;
  image: string;
  images?: string[];
  originalPrice: number;
  agentPrice: number;
  earningPerUnit: number;
  hasCustomPrice: boolean;
  status: "Active" | "Inactive";
  samplePrice?: number;
  stock?: number;
};

export type SalesAgentOrder = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  productName: string;
  productCode: string;
  qty: number;
  unitPrice: number;
  baseUnitPrice?: number;
  agentUnitPrice?: number;
  agentEarning?: number;
  agentPayoutStatus?: "Pending" | "Paid";
  agentPayoutAt?: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  date: string;
  type: string;
};

export type SalesAgentLoginResponse = {
  agent: SalesAgent;
  message: string;
};

export type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number };
};