import { useQuery } from "@tanstack/react-query";
import { fetchB2BProducts, fetchNewCollectionProducts, fetchWelcomeKitItems } from "@/lib/api";
import { filterB2BProducts, mapNewCollectionToCatalog } from "@/lib/productMappers";
import { queryKeys } from "./queryKeys";

export function useB2BProducts(subCategoryName?: string) {
  const query = useQuery({
    queryKey: queryKeys.b2bProducts,
    queryFn: fetchB2BProducts,
  });

  const products = filterB2BProducts(query.data ?? [], subCategoryName);
  return { ...query, products };
}

export function useNewCollectionProducts(
  limit = 9,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: queryKeys.newCollection,
    queryFn: fetchNewCollectionProducts,
    enabled,
  });

  const products = (query.data ?? [])
    .filter((p) => p.status === "Active")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(mapNewCollectionToCatalog);

  return { ...query, products };
}

export function useWelcomeKitItems() {
  return useQuery({
    queryKey: queryKeys.welcomeKits,
    queryFn: fetchWelcomeKitItems,
    select: (items) => items.filter((i) => i.enabled),
  });
}