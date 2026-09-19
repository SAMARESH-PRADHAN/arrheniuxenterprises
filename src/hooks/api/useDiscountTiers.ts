import { useQuery } from "@tanstack/react-query";
import { fetchDiscountTiers } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export function useDiscountTiers() {
  return useQuery({
    queryKey: queryKeys.discountTiers,
    queryFn: fetchDiscountTiers,
    staleTime: 30 * 1000,        // 30s instead of 5 min
    refetchOnWindowFocus: true,  // refresh when user returns to tab
  });
}