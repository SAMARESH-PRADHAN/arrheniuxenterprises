import { useQuery } from "@tanstack/react-query";
import { fetchPrintSettings } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export function usePrintSettings() {
  return useQuery({
    queryKey: queryKeys.printSettings,
    queryFn: fetchPrintSettings,
    staleTime: 5 * 60 * 1000,
  });
}