// Print method system: Embroidery / DTF / Sublimation with per-option pricing.
export type PrintOption = { id: string; label: string; pricePerPc: number };
export type PrintMethodId = "embroidery" | "dtf" | "sublimation" | "laser" | "digital";
export type PrintMethod = { id: PrintMethodId; label: string; options: PrintOption[]; note?: string };

export const PRINT_METHODS: PrintMethod[] = [
  {
    id: "embroidery",
    label: "Embroidery Print",
    note: "Supports 1–3 thread color embroidery.",
    options: [
      { id: "chest-emb", label: "Chest Logo (1–3 thread colors)", pricePerPc: 20 },
    ],
  },
  {
    id: "dtf",
    label: "DTF Print",
    options: [
      { id: "chest", label: "Chest Print (4×4 inch)", pricePerPc: 0 },
      { id: "back-name", label: "Back Name (9×2 inch)", pricePerPc: 40 },
      { id: "front-a4", label: "Front Print (A4)", pricePerPc: 40 },
      { id: "back-a4", label: "Back Print (A4)", pricePerPc: 40 },
      { id: "front-a3", label: "Front Print (A3)", pricePerPc: 80 },
      { id: "back-a3", label: "Back Print (A3)", pricePerPc: 80 },
      { id: "hand", label: "Hand Print (2×2 inch)", pricePerPc: 10 },
    ],
  },
  {
    id: "sublimation",
    label: "Sublimation Print",
    options: [
      { id: "sub-a4", label: "Sublimation A4 Print", pricePerPc: 30 },
      { id: "sub-back-name", label: "Sublimation Back Name", pricePerPc: 20 },
      { id: "sub-logo", label: "Sublimation Logo", pricePerPc: 10 },
    ],
  },
];

export type PrintSelection = {
  method: PrintMethodId | null;
  options: string[];
};

export const emptyPrint = (): PrintSelection => ({ method: null, options: [] });

// Optional override: caller can pass a custom methods list (e.g. accessory-specific).
export const printPricePerPc = (sel: PrintSelection, methods: PrintMethod[] = PRINT_METHODS): number => {
  if (!sel.method) return 0;
  const m = methods.find((x) => x.id === sel.method);
  if (!m) return 0;
  return sel.options.reduce(
    (sum, oid) => sum + (m.options.find((o) => o.id === oid)?.pricePerPc ?? 0),
    0
  );
};

export const printLabel = (sel: PrintSelection, methods: PrintMethod[] = PRINT_METHODS): string => {
  if (!sel.method) return "No Print";
  const m = methods.find((x) => x.id === sel.method);
  if (!m) return "No Print";
  const chosen = sel.options
    .map((id) => m.options.find((o) => o.id === id)?.label)
    .filter(Boolean);
  return chosen.length ? `${m.label} — ${chosen.join(", ")}` : m.label;
};

// Encode/decode PrintSelection for URL params (used to preserve state on redirect to Bulk Order).
export const encodePrint = (sel: PrintSelection): string => {
  if (!sel.method) return "";
  return `${sel.method}:${sel.options.join(",")}`;
};
export const decodePrint = (raw: string | null): PrintSelection => {
  if (!raw) return emptyPrint();
  const [method, opts] = raw.split(":");
  const valid: PrintMethodId[] = ["embroidery", "dtf", "sublimation", "laser", "digital"];
  if (!valid.includes(method as PrintMethodId)) return emptyPrint();
  return { method: method as PrintMethodId, options: (opts || "").split(",").filter(Boolean) };
};
