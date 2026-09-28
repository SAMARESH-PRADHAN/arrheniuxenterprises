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
  const cat = catSlug ? findCategory(catSlug) : undefined;
  const catName = catSlug ? findCategory(catSlug)?.name : undefined;
  const apiType = apiTypeFromTier(tier);
  
  // Get exact sub-category name from catalog
  let subName: string | undefined;
  if (cat && subSlug) {
    const subs = cat.hasTiers
      ? tier === "regular"
        ? cat.regular ?? []
        : tier === "premium"
          ? cat.premium ?? []
          : []
      : cat.items ?? [];
    subName = subs.find((s) => s.slug === subSlug)?.name;
  }

  const query = useProducts({ 
    status: "Active", 
    category: catName, 
    type: apiType,
    subCategory: subName, 
    limit: 200,
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
