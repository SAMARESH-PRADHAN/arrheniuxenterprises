import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, fetchReviews } from "@/lib/api";
import { apiReviewToStorefront, type StorefrontReview } from "@/lib/orderMappers";
import { queryKeys } from "./queryKeys";

export function useReviews(status?: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: queryKeys.reviews(status),
    queryFn: () => fetchReviews(status),
    enabled,
    select: (rows) =>
      rows
        .filter((r) => !status || r.status === status)
        .map((r) => apiReviewToStorefront(r)),
  });
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews("Approved"),
    queryFn: () => fetchReviews("Approved"),
    select: (rows) =>
      rows
        .filter((r) => r.productId === productId && r.status === "Approved")
        .map((r) => apiReviewToStorefront(r)),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}