import {
  catalog,
  findCategory,
  type CatalogProduct,
  type Tier,
} from "@/data/catalog";
import type {
  ApiB2BProduct,
  ApiNewCollectionProduct,
  ApiProduct,
  BASE,
} from "@/lib/api";

function resolveImage(url: string | undefined, fallback = ""): string {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const base = BASE.replace(/\/api\/?$/, ""); // strip /api suffix for uploads
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function resolveCategorySlug(categoryName: string): string {
  const match = catalog.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  return match?.slug ?? slugify(categoryName);
}

export function tierFromApiType(type: ApiProduct["type"]): Tier | undefined {
  if (type === "Regular") return "regular";
  if (type === "Premium") return "premium";
  return undefined;
}

export function apiTypeFromTier(tier?: string): ApiProduct["type"] | undefined {
  if (tier === "regular") return "Regular";
  if (tier === "premium") return "Premium";
  return undefined;
}

function colorHex(c: string | { name: string; hex: string }): string {
  return typeof c === "string" ? c : c.hex;
}

function formatPrice(amount: number): string {
  return `₹${Math.round(amount)}`;
}

export function mapApiProductToCatalog(
  p: ApiProduct,
  fallbackImage?: string,
): CatalogProduct {
  const categorySlug = resolveCategorySlug(p.category);
  const subSlug = slugify(p.subCategory || p.name);
  const image = resolveImage(p.image, fallbackImage);
  const gallery = p.images?.length ? p.images.map(i => resolveImage(i)) : image ? [image] : [];

  return {
    id: p.id,
    code: p.code,   // ← added this
    name: p.name,
    categorySlug,
    subSlug,
    tier: tierFromApiType(p.type),
    fabric: p.material || p.name,
    gsm: p.type === "Premium" ? "Premium" : "Standard",
    moq: 20,
    price: formatPrice(p.originalPrice),
     samplePrice: p.samplePrice ?? 0,   // ← add this
    image,
    gallery,
    colors: (p.colors ?? []).map(colorHex),
    description: p.description,
    material: p.material,
    isNew: false,
    addedAt: new Date(p.createdAt).getTime(),
    overview: p.overview,
specifications: p.specifications,
designGuidelines: p.designGuidelines,
washCare: p.washCare,
kitItems: p.kitItems ?? [],
  };
}

export function mapB2BProductToCatalog(p: ApiB2BProduct, catSlug = "b2b"): CatalogProduct {
  const subSlug = slugify(p.subCategory || "b2b");
  const image = resolveImage(p.image);
  const gallery = p.images?.length ? p.images.map(i => resolveImage(i)) : image ? [image] : [];

  return {
    id: p.id,
    code: p.code,   // ← added this
    name: p.name,
    categorySlug: catSlug,
    subSlug,
    tier: "premium",
    fabric: p.material || p.name,
    gsm: "Standard",
    moq: 14,
    price: formatPrice(p.originalPrice),
    samplePrice: p.samplePrice ?? 0,
    image,
    gallery,
    colors: [],
    description: p.description,
    material: p.material,
    addedAt: new Date(p.createdAt).getTime(),
    overview: p.overview,
specifications: p.specifications,
designGuidelines: p.designGuidelines,
washCare: p.washCare,
  };
}

export function mapNewCollectionToCatalog(p: ApiNewCollectionProduct): CatalogProduct {
  const image = resolveImage(p.image);
  const gallery = p.images?.length ? p.images.map(i => resolveImage(i)) : image ? [image] : [];

  return {
    id: p.id,
    code: p.code,   // ← added this
    name: p.name,
    categorySlug: "new-collection",
    subSlug: slugify(p.name),
    fabric: p.material || p.name,
    gsm: "Standard",
    moq: 5,
    price: formatPrice(p.originalPrice),
    samplePrice: p.samplePrice ?? 0,
    image,
    gallery,
    colors: [],
    description: p.description,
    material: p.material,
    isNew: true,
    addedAt: new Date(p.createdAt).getTime(),
    overview: p.overview,
specifications: p.specifications,
designGuidelines: p.designGuidelines,
washCare: p.washCare,
  };
}

/** Filter API products for a catalog subcategory listing page. */
export function filterProductsForSubcategory(
  products: ApiProduct[],
  catSlug: string,
  tier: string | undefined,
  subSlug: string,
  context: "category" | "bulk" = "category",
): CatalogProduct[] {
  const cat = findCategory(catSlug);
  if (!cat) return [];

  const subs =
    cat.hasTiers
      ? tier === "regular"
        ? cat.regular ?? []
        : tier === "premium"
          ? cat.premium ?? []
          : []
      : cat.items ?? [];

  const sub = subs.find((s) => s.slug === subSlug);
  if (!sub) return [];

  const apiType = apiTypeFromTier(tier);

  return products
   .filter((p) => {
      if (p.status !== "Active") return false;
      const vis = p.visibility ?? "Both";
      if (context === "bulk" && vis !== "Bulk" && vis !== "Both") return false;
      if (context === "category" && vis !== "Category" && vis !== "Both") return false;
      if (p.category.toLowerCase() !== cat.name.toLowerCase()) return false;
      if (apiType && p.type !== apiType) return false;
      if (p.subCategory && sub.name) {
        return (
          slugify(p.subCategory) === subSlug ||
          p.subCategory.toLowerCase() === sub.name.toLowerCase()
        );
      }
      return true;
    })

    .map((p) =>
      mapApiProductToCatalog(p, sub.image),
    );
}

/** Bulk-order listing: active products visible in bulk or both. */
export function filterBulkProducts(products: ApiProduct[]): CatalogProduct[] {
  return products
    .filter(
      (p) =>
        p.status === "Active" &&
        (p.visibility === "Bulk" || p.visibility === "Both"),
    )
    .map((p) => mapApiProductToCatalog(p));
}

export function filterB2BProducts(
  products: ApiB2BProduct[],
  subCategoryName?: string,
): CatalogProduct[] {
  return products
    .filter((p) => {
      if (p.status !== "Active") return false;
      if (!subCategoryName) return true;
      return (
        p.subCategory.toLowerCase() === subCategoryName.toLowerCase() ||
        slugify(p.subCategory) === slugify(subCategoryName)
      );
    })
    .map((p) => mapB2BProductToCatalog(p));
}

export { slugify };
