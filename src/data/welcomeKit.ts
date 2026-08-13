import { WELCOME_KIT_ITEMS, type CatalogProduct } from "./catalog";

export type KitItemDef = { id: string; label: string; price: number; required?: boolean };

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function getKitItemDefs(product: Pick<CatalogProduct, "kitItems">): KitItemDef[] {
  const adminItems = product.kitItems ?? [];

  if (adminItems.length > 0) {
    const tshirtEntry = adminItems.find((k) => k.name.trim().toLowerCase() === "t-shirt");
    const extras = adminItems.filter((k) => k.name.trim().toLowerCase() !== "t-shirt");

    const fixedTshirt: KitItemDef = {
      id: "tshirt",
      label: "T-Shirt",
      price: tshirtEntry?.price ?? 200,
      required: true,
    };

    return [
      fixedTshirt,
      ...extras.map((k, i) => ({ id: slugify(k.name) || `item-${i}`, label: k.name, price: k.price })),
    ];
  }

  return WELCOME_KIT_ITEMS.map((k) => ({
    id: k.id,
    label: k.label,
    price: k.price,
    required: k.id === "tshirt",
  }));
}

export function kitUnitPrice(selectedIds: string[], defs: KitItemDef[]): number {
  return selectedIds.reduce((sum, id) => sum + (defs.find((d) => d.id === id)?.price ?? 0), 0);
}