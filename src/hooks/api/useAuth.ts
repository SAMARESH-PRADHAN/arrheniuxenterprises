import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  createOrder,
  createPayment,
  createSampleOrder,
  fetchCustomers,
  fetchCustomer,
  loginCustomer,
  ApiError,
  type CreateCustomerInput,
} from "@/lib/api";
import { toCreateOrderInput, type PlaceOrderPayload } from "@/lib/orderMappers";
import { customerToSessionUser, setSession, type AuthResult } from "@/lib/session";
import { queryKeys } from "./queryKeys";

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.customer(id ?? ""),
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: CreateCustomerInput & { password: string },
    ): Promise<AuthResult> => {
      try {
        const customer = await createCustomer({
          name: data.name,
          email: data.email,
          phone: data.phone ?? "",
          address: "",
          password: data.password,
        });
        const user = customerToSessionUser(customer);
        setSession(user);
        await qc.invalidateQueries({ queryKey: queryKeys.customers });
        return { ok: true, user };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          return { ok: false, error: "Email already registered" };
        }
        return { ok: false, error: "Signup failed" };
      }
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      try {
        const customer = await loginCustomer(email, password);
        const user = customerToSessionUser(customer);
        setSession(user);
        return { ok: true, user };
      } catch (err) {
        if (err instanceof ApiError) {
          return { ok: false, error: err.message };
        }
        return { ok: false, error: "Login failed" };
      }
    },
  });
}
export function useGoogleLogin() {
  return useMutation({
    mutationFn: async (idToken: string): Promise<AuthResult> => {
      try {
        const { loginWithGoogle } = await import("@/lib/api");
        const customer = await loginWithGoogle(idToken);
        const user = customerToSessionUser(customer);
        setSession(user);
        return { ok: true, user };
      } catch (err) {
        if (err instanceof ApiError) return { ok: false, error: err.message };
        return { ok: false, error: "Google login failed" };
      }
    },
  });
}
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlaceOrderPayload) => {
      const body = toCreateOrderInput(payload);
      const order = payload.isSample
        ? await createSampleOrder(body)
        : await createOrder(body);

      if (payload.paid > 0) {
        await createPayment({
          orderId: order.id,
          customer: payload.customerName,
          amount: payload.paid,
          status: payload.paid >= payload.total ? "Paid" : "Partial",
          date: new Date().toISOString().slice(0, 10),
        });
      }

      if (payload.customerId) {
        try {
          const { fetchCustomer, patchCustomer } = await import("@/lib/api");
          const customer = await fetchCustomer(payload.customerId);
          await patchCustomer(payload.customerId, {
            totalOrders: (customer.totalOrders ?? 0) + 1,
            totalSpend: (customer.totalSpend ?? 0) + payload.total,
            address: customer.address?.trim() ? customer.address : (payload.address ?? ""),
          });
          qc.invalidateQueries({ queryKey: queryKeys.customer(payload.customerId) });
        } catch (err) {
          console.error("Failed to sync customer stats:", err);
        }
      }

      await qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: queryKeys.customers });
      return order;
    },
  });
}

export function useCustomerOrders(customerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders(customerId),
    queryFn: async () => {
      const { fetchOrders, fetchSampleOrders } = await import("@/lib/api");
      const [orders, samples] = await Promise.all([fetchOrders(), fetchSampleOrders()]);
      if (!customerId) return [];
      return [...orders, ...samples].filter((o) => o.customerId === customerId);
    },
    enabled: !!customerId,
  });
}