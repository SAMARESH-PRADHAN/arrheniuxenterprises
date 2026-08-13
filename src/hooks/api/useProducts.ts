import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type ProductFilters } from "@/lib/api";
import { apiTypeFromTier, filterProductsForSubcategory, filterBulkProducts } from "@/lib/productMappers";
import { findCategory } from "@/data/catalog";
import { queryKeys } from "./queryKeys";

export function useProducts(filters: ProductFilters = { status: "Active" }) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => fetchProducts(filters),
  });
}

export function useCatalogProducts(
  catSlug: string | undefined,
  tier: string | undefined,
  subSlug: string | undefined,
) {
  const catName = catSlug ? findCategory(catSlug)?.name : undefined;
  const apiType = apiTypeFromTier(tier);
  
  const query = useProducts({ 
    status: "Active", 
    category: catName, 
    type: apiType 
  });

  const products =
    catSlug && subSlug
            ? filterProductsForSubcategory(query.data ?? [], catSlug, tier, subSlug, "category")
      : [];

  return { ...query, products };
}

export function useBulkCatalogProducts() {
  const query = useProducts({ status: "Active" });
  const products = filterBulkProducts(query.data ?? []);
  return { ...query, products };
}
