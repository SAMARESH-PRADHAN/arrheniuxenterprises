import { useQuery } from "@tanstack/react-query";
import { fetchAnyProduct } from "@/lib/api";
import {
  mapApiProductToCatalog,
  mapB2BProductToCatalog,
  mapNewCollectionToCatalog,
} from "@/lib/productMappers";
import type { CatalogProduct } from "@/data/catalog";
import { queryKeys } from "./queryKeys";

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: async (): Promise<CatalogProduct | null> => {
      if (!id) return null;
      const result = await fetchAnyProduct(id);
      if (result.source === "products") {
        return mapApiProductToCatalog(result.product);
      }
      if (result.source === "b2b") {
        return mapB2BProductToCatalog(result.product);
      }
      return mapNewCollectionToCatalog(result.product);
    },
    enabled: !!id,
  });
}

export function useRelatedProducts(
  categorySlug: string | undefined,
  excludeId: string | undefined,
  allProducts: CatalogProduct[],
) {
  return allProducts
    .filter((p) => p.categorySlug === categorySlug && p.id !== excludeId)
    .slice(0, 4);
}
