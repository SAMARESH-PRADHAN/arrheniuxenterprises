import { useQuery } from "@tanstack/react-query";
import { fetchMoqSettings } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export function useMoqSettings() {
  return useQuery({
    queryKey: queryKeys.moqSettings,
    queryFn: fetchMoqSettings,
    staleTime: 5 * 60 * 1000,
  });
}