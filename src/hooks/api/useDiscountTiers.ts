import { useQuery } from "@tanstack/react-query";
import { fetchDiscountTiers } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export function useDiscountTiers() {
  return useQuery({
    queryKey: queryKeys.discountTiers,
    queryFn: fetchDiscountTiers,
    staleTime: 5 * 60 * 1000,
  });
}