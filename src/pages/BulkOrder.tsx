import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, CreditCard } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PrintPicker } from "@/components/PrintPicker";
import {
  ArtworkUpload,
  artworkSummary,
  type ArtworkFile,
} from "@/components/ArtworkUpload";
import { Loader2 } from "lucide-react";
import { getKitItemDefs, kitUnitPrice } from "@/data/welcomeKit";
import {
  catalog,
  findCategory,
  getSubsForTier,
  isNonGarmentCategory,
  isArrheniuxCategory,
  isWelcomeKitCategory,
  supportsPrint,
  getAccessoryRules,
  getGstPct,
  getCourierPerPc,
  priceValue,
  productCode,
  COURIER_PER_PC,
  BULK_DISCOUNT_PCT,
  BULK_THRESHOLD,
  getSizesFor,
  emptySizes,
  APPAREL_SIZES,
  WELCOME_KIT_ITEMS,
  WELCOME_KIT_MIN,
  WELCOME_KIT_MIN_ITEMS,
  welcomeKitUnitPrice,
  type Tier,
  type CatalogProduct,
} from "@/data/catalog";
import {
  emptyPrint,
  printPricePerPc,
  printLabel,
  decodePrint,
  type PrintSelection,
  type PrintMethod,
} from "@/data/printOptions";
import { waLink } from "@/data/site";
import { getSession } from "@/lib/session";
import { filterProductsForSubcategory } from "@/lib/productMappers";
import { openRazorpay } from "@/lib/razorpay";
import { toast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/SuccessDialog";
import { useCreateOrder, useProduct, useProducts } from "@/hooks/api";
import { BrandLoader } from "@/components/BrandLoader";

const SIZE_STEP = 2;

const PDP_DRAFT_KEY = "arr_pdp_draft";
const BULK_REDIRECT_DRAFT_KEY = "arr_bulk_redirect_draft"; // ← add this, must match ProductDetail.tsx

const loadPdpDraft = (productId: string) => {
  try {
    const raw = JSON.parse(localStorage.getItem(PDP_DRAFT_KEY) || "{}");
    return raw.productId === productId ? raw : null;
  } catch {
    return null;
  }
};
const savePdpDraft = (data: unknown) => {
  try {
    localStorage.setItem(PDP_DRAFT_KEY, JSON.stringify(data));
  } catch {}
};
const clearPdpDraft = () => localStorage.removeItem(PDP_DRAFT_KEY);

// Bulk Order excludes ARRHENIUX line — standard categories only.
const bulkCatalog = () => catalog.filter((c) => !isArrheniuxCategory(c.slug));

const parseSizesParam = (
  raw: string | null,
  allowed: readonly string[],
): Record<string, number> => {
  const base: Record<string, number> = Object.fromEntries(
    allowed.map((s) => [s, 0]),
  );
  if (!raw) return base;
  raw.split(",").forEach((chunk) => {
    const [s, q] = chunk.split(":");
    if (allowed.includes(s)) base[s] = Math.max(0, Number(q) || 0);
  });
  return base;
};

type DraftCustomer = {
  fullName: string;
  company: string;
  gst: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

const EMPTY_CUSTOMER: DraftCustomer = {
  fullName: "",
  company: "",
  gst: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};
const DRAFT_KEY = "arr_bulk_draft";

const loadDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
};
const saveDraft = (d: unknown) =>
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d));

const BulkOrder = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const createOrderMut = useCreateOrder();
const { data: apiProducts = [], isLoading: productsLoading } = useProducts({ status: "Active" });
  const urlPid = params.get("product");
  const { data: urlProduct } = useProduct(urlPid ?? undefined);

  const initial = useMemo(() => {
    const urlQty = Number(params.get("qty")) || 0;
    const urlCat = params.get("cat");
    const urlTier = params.get("tier");
    const urlSub = params.get("sub");
    const urlColor = params.get("color") || "";
    const urlPrint = decodePrint(params.get("print"));
    const draft = loadDraft();
    if (urlCat) {
      const allowed = getSizesFor(urlCat);
      const urlSizes = parseSizesParam(params.get("sizes"), allowed);
      const hasUrlSizes = Object.values(urlSizes).some((n) => n > 0);
      return {
        catSlug: urlCat,
        tier: (urlTier as Tier) || "",
        subSlug: urlSub || "",
        productId: urlPid || "",
        color: urlColor,
        unitQty: BULK_THRESHOLD,
        sizeQty: hasUrlSizes ? urlSizes : emptySizes(urlCat),
        customer: draft.customer || EMPTY_CUSTOMER,
        print: urlPrint.method ? urlPrint : emptyPrint(),
        seedQty: urlQty,
      };
    }
    return { ...draft, seedQty: urlQty };
  }, [params, urlPid]);

  const catList = bulkCatalog();
  const [catSlug, setCatSlug] = useState<string>(
    initial.catSlug || catList[0].slug,
  );
  const [tier, setTier] = useState<Tier | "">(initial.tier ?? "");
  const [subSlug, setSubSlug] = useState<string>(initial.subSlug || "");
  const [productId, setProductId] = useState<string>(initial.productId || "");
  const [color, setColor] = useState<string>(initial.color || "");
  const [unitQty, setUnitQty] = useState<number>(
    initial.unitQty ?? BULK_THRESHOLD,
  );
  const [sizeQty, setSizeQty] = useState<Record<string, number>>(
    initial.sizeQty || emptySizes(initial.catSlug || catList[0].slug),
  );
  const [customer, setCustomer] = useState<DraftCustomer>(
    initial.customer || EMPTY_CUSTOMER,
  );
  const [printSel, setPrintSel] = useState<PrintSelection>(
    initial.print || emptyPrint(),
  );
  const [artwork, setArtwork] = useState<ArtworkFile[]>([]);
  const [namedColor, setNamedColor] = useState<string>("");
  const [printColor, setPrintColor] = useState<string>("");
  const [activeImg, setActiveImg] = useState(0);
  const [successOrder, setSuccessOrder] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  // Welcome-kit builder state
  const [kitItems, setKitItems] = useState<string[]>(["tshirt"]);
  const [kitQtyManual, setKitQtyManual] = useState<number>(WELCOME_KIT_MIN);
  const SIZES = getSizesFor(catSlug);
  const [error, setError] = useState("");
  const [payingMode, setPayingMode] = useState<"full" | "advance-50" | null>(
    null,
  );
  const [savingOrder, setSavingOrder] = useState(false);
  useEffect(() => {
    if (!urlProduct) return;
    const urlQty = Number(params.get("qty")) || 0;
    const urlColor = params.get("color") || "";
    const urlPrint = decodePrint(params.get("print"));
    const allowed = getSizesFor(urlProduct.categorySlug);
    const urlSizes = parseSizesParam(params.get("sizes"), allowed);
    const hasUrlSizes = Object.values(urlSizes).some((n) => n > 0);
    const seedQty = Math.max(BULK_THRESHOLD, urlQty);
    setCatSlug(urlProduct.categorySlug);
    setTier((urlProduct.tier as Tier) || "");
    setSubSlug(urlProduct.subSlug);
    setProductId(urlProduct.id);
    setColor(urlColor || urlProduct.colors[0] || "");
    setUnitQty(seedQty);
    setSizeQty(hasUrlSizes ? urlSizes : emptySizes(urlProduct.categorySlug));
    if (urlPrint.method) setPrintSel(urlPrint);
   // Restore the full draft saved on the product page (sizes, uploaded
  // artwork, print selection, welcome-kit items) — URL params alone can't
  // carry file uploads, so this fills in what the URL-based seeding above
  // couldn't.
  try {
    const raw = localStorage.getItem(BULK_REDIRECT_DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.productId === urlProduct.id) {
        if (draft.sizeQty) setSizeQty(draft.sizeQty);
        if (typeof draft.unitQty === "number") setUnitQty(Math.max(BULK_THRESHOLD, draft.unitQty));
        if (draft.printSel) setPrintSel(draft.printSel);
        if (draft.artwork) setArtwork(draft.artwork);
        if (draft.kitItems) setKitItems(draft.kitItems);
        if (typeof draft.kitQtyManual === "number") setKitQtyManual(draft.kitQtyManual);
        if (draft.namedColor) setNamedColor(draft.namedColor);
        if (draft.printColor) setPrintColor(draft.printColor);
      }
      localStorage.removeItem(BULK_REDIRECT_DRAFT_KEY);
    }
  } catch {
    // corrupted/unavailable draft — the URL-seeded values above still apply
  }
}, [urlProduct, params]);
useEffect(() => {
  setActiveImg(0);
}, [productId]);
  const cat = findCategory(catSlug)!;
  const showsTierStep = cat.hasTiers;
  const subs = cat.hasTiers
    ? getSubsForTier(cat, tier || undefined)
    : (cat.items ?? []);
  const subcat = subs.find((s) => s.slug === subSlug);
  const products: CatalogProduct[] = useMemo(
    () =>
      subSlug
        ? filterProductsForSubcategory(
            apiProducts,
            catSlug,
            tier || undefined,
            subSlug,
            "bulk",
          )
        : [],
    [apiProducts, catSlug, tier, subSlug],
  );
  const product = products.find((p) => p.id === productId);
  const kitDefs = useMemo(() => (product ? getKitItemDefs(product) : []), [product]);
  const isKit = isWelcomeKitCategory(catSlug);
  const isGarment = product
    ? !isNonGarmentCategory(product.categorySlug)
    : !isNonGarmentCategory(catSlug);
  const rule = product ? getAccessoryRules(product.subSlug) : null;
  const canPrint =
    !isKit &&
    !isArrheniuxCategory(catSlug) &&
    rule?.print.kind !== "none" &&
    (supportsPrint(catSlug) ||
      rule?.print.kind === "custom" ||
      rule?.print.kind === "free");
  const gstRate = product ? getGstPct(product) : 0.05;
  const gstPctLabel = Math.round(gstRate * 100);

  const restrictedMethods: PrintMethod[] | undefined =
    rule?.print.kind === "custom"
      ? rule.print.methods.map((m) => ({
          id: m.id,
          label:
            m.label ??
            (m.id === "dtf"
              ? "DTF Print"
              : m.id === "sublimation"
                ? "Sublimation Print"
                : m.id === "laser"
                  ? "Laser Print"
                  : m.id === "digital"
                    ? "Digital Print"
                    : "Embroidery Print"),
          options: m.options,
        }))
      : undefined;
  const printFreeLabel = rule?.print.kind === "free" ? rule.print.label : null;
  const printDisabled = rule?.print.kind === "none";

  useEffect(() => {
    if (!cat.hasTiers) setTier("");
    setSubSlug((prev) => (subs.find((s) => s.slug === prev) ? prev : ""));
    // Reset size quantities when the applicable size set differs.
    setSizeQty((prev) => {
      const allowed = getSizesFor(catSlug);
      const sameKeys =
        Object.keys(prev).length === allowed.length &&
        allowed.every((k) => k in prev);
      return sameKeys ? prev : emptySizes(catSlug);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catSlug, tier]);

  useEffect(() => {
  if (productsLoading) return; // don't clear productId while product list is still loading
  setProductId((prev) => (products.find((p) => p.id === prev) ? prev : ""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [subSlug, productsLoading]);

  useEffect(() => {
    if (product && !color) setColor(product.colors[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Consume the saved draft exactly once (mirrors ProductDetail.tsx). The
  // draft is only ever written right before redirecting to /auth (see
  // handlePay below), so this restores it after that specific round-trip —
  // then wipes it so simply leaving the page and coming back later does NOT
  // bring old input back.
  useEffect(() => {
    localStorage.removeItem(DRAFT_KEY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kitIncludesTshirt = kitItems.includes("tshirt");
  const kitSizeTotal = Object.values(sizeQty).reduce((a, b) => a + b, 0);
  const kitQty = isKit ? (kitIncludesTshirt ? kitSizeTotal : kitQtyManual) : 0;
  const kitEnoughItems = kitItems.length >= WELCOME_KIT_MIN_ITEMS;
  const kitUnit = isKit ? kitUnitPrice(kitItems, kitDefs) : 0;

  const total = isKit ? kitQty : isGarment ? kitSizeTotal : unitQty;
  const unitPrice = isKit ? kitUnit : product ? priceValue(product) : 0;
  const perPcPrint = canPrint
    ? printPricePerPc(printSel, restrictedMethods)
    : 0;
  const printCharge = perPcPrint * total;
  const printText = isKit
    ? "Company Logo Printing — FREE"
    : canPrint
      ? printLabel(printSel, restrictedMethods)
      : "N/A";
  const subtotal = unitPrice * total + printCharge;
  const bulkPct = isKit
    ? 0
    : rule && !rule.discountEnabled
      ? 0
      : BULK_DISCOUNT_PCT;
  const discountAmt = Math.round((subtotal * bulkPct) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const courierPc = product ? getCourierPerPc(product) : COURIER_PER_PC;
  const courier = total * courierPc;
  const gst = Math.round((afterDiscount + courier) * gstRate);
  const grandTotal = afterDiscount + courier + gst;

  const validate = (): string | null => {
    if (!product) return "Please choose a product.";
    if (isKit) {
      if (!kitEnoughItems)
        return `Please select at least ${WELCOME_KIT_MIN_ITEMS} products for the kit.`;
      if (total < WELCOME_KIT_MIN)
        return `Welcome Kit minimum is ${WELCOME_KIT_MIN} kits. Current: ${total}.`;
    } else if (total < BULK_THRESHOLD)
      return `Bulk orders require ${BULK_THRESHOLD}+ pcs. Current total: ${total}.`;
    const c = customer;
    if (
      !c.fullName ||
      !c.company ||
      !c.phone ||
      !c.email ||
      !c.address ||
      !c.city ||
      !c.state ||
      !c.pincode
    )
      return "Please complete all required customer fields.";
    return null;
  };

  const buildMessage = (mode: "full" | "advance-50", paid: number) => {
    const lines: string[] = [];
    lines.push(
      `Hi Arrheniux, my payment (${mode === "full" ? "100% full" : "50% advance"}) is complete for a *BULK ORDER*:`,
    );
    lines.push("");
    lines.push("*Product Details*");
    lines.push(`• Category: ${cat.name}`);
    if (cat.hasTiers && tier)
      lines.push(`• Tier: ${tier === "premium" ? "Premium" : "Regular"}`);
    if (subcat) lines.push(`• Subcategory: ${subcat.name}`);
    if (product) {
      lines.push(`• Product: ${product.name}`);
      lines.push(`• Code: ${productCode(product)}`);
      lines.push(`• Material: ${product.material}`);
      if (rule?.namedColors)
        lines.push(`• Color / Variant: ${namedColor || rule.namedColors[0]}`);
      if (rule?.printColors)
        lines.push(`• Print Color: ${printColor || rule.printColors[0]}`);
    }
    if (isKit) {
      const list = kitItems
        .map((id) => {
          const it = kitDefs.find((k) => k.id === id);
          return it ? `${it.label} (₹${it.price})` : id;
        })
        .join(", ");
      lines.push(`• Kit Items: ${list}`);
      lines.push(`• Print: Company Logo Printing — FREE`);
      lines.push(`• Free Custom Tote Bag included with every kit`);
    } else if (canPrint) lines.push(`• Print: ${printText}`);
    lines.push(`• Artwork Files: ${artworkSummary(artwork)}`);
    if (isKit && kitIncludesTshirt) {
      lines.push("• T-Shirt Sizes:");
      SIZES.filter((s) => sizeQty[s] > 0).forEach((s) =>
        lines.push(`   - ${s}: ${sizeQty[s]} pcs`),
      );
    } else if (!isKit && isGarment) {
      lines.push("• Sizes:");
      SIZES.filter((s) => sizeQty[s] > 0).forEach((s) =>
        lines.push(`   - ${s}: ${sizeQty[s]} pcs`),
      );
    }
    lines.push(
      isKit ? `• Total Kits: ${total}` : `• Total Quantity: ${total} pcs`,
    );
    lines.push("");
    lines.push("*Pricing*");
    lines.push(`• Unit Price: ₹${unitPrice}`);
    if (printCharge > 0) lines.push(`• Print Charge: ₹${printCharge}`);
    lines.push(`• Subtotal: ₹${subtotal}`);
    lines.push(`• Bulk Discount (${bulkPct}%): −₹${discountAmt}`);
    lines.push(
      courierPc > 0
        ? `• Courier (₹${courierPc}×${total}): ₹${courier}`
        : `• Courier: FREE`,
    );
    lines.push(`• GST ${gstPctLabel}%: ₹${gst}`);
    lines.push(`• *Grand Total: ₹${grandTotal}*`);
    lines.push(`• *Amount Paid: ₹${paid}*`);
    if (mode === "advance-50")
      lines.push(`• Balance Due: ₹${grandTotal - paid}`);
    lines.push("");
    lines.push("*Customer Details*");
    lines.push(`• Name: ${customer.fullName}`);
    lines.push(`• Company: ${customer.company}`);
    if (customer.gst) lines.push(`• GST: ${customer.gst}`);
    lines.push(`• Phone: ${customer.phone}`);
    lines.push(`• Email: ${customer.email}`);
    lines.push(
      `• Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
    );
    if (customer.notes) {
      lines.push("");
      lines.push(`*Notes*: ${customer.notes}`);
    }
    lines.push("");
    lines.push(
      "Sharing logo / artwork / printing design / reference images in the next messages.",
    );
    return lines.join("\n");
  };

  const persistOrder = async (mode: "full" | "advance-50", paid: number) => {
    const user = getSession();
    if (!user || !product) return null;
    return createOrderMut.mutateAsync({
      kind: "bulk",
      customerId: user.id,
      customerName: customer.fullName || user.name,
      phone: customer.phone || user.phone || "",
      email: customer.email || user.email,
      address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
      productId: product.id,
      productCode: productCode(product),
      productName: product.name,
      category: cat.name,
      productType:
        product.tier === "premium"
          ? "Premium"
          : product.tier === "regular"
            ? "Regular"
            : "",
      subCategory: subcat?.name ?? "",
      material: product.material,
      description: isKit
  ? `Kit Items: ${kitItems
      .map((id) => {
        const it = kitDefs.find((d) => d.id === id);
        return it ? `${it.label} (₹${it.price})` : id;
      })
      .join(", ")}`
  : product.description,
      printType: printText,
      sizes: (isGarment || (isKit && kitIncludesTshirt)) ? sizeQty : undefined,
      qty: total,
      unitPrice,
      printingPrice: printCharge,
      gstPct: gstPctLabel,
      shipping: courier,
      total: grandTotal,
      paid,
      uploadedLogo: artwork[0]?.dataUrl ?? "",
      discountPct: bulkPct,
      discountAmt,
      paymentMode: mode,
    });
  };

  const handlePay = (mode: "full" | "advance-50") => {
    if (payingMode) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const user = getSession();
    if (!user) {
      saveDraft({
        catSlug,
        tier,
        subSlug,
        productId,
        color,
        unitQty,
        sizeQty,
        customer,
        print: printSel,
      });
      navigate(`/auth?next=${encodeURIComponent("/bulk-order")}`);
      return;
    }
    setPayingMode(mode);
    const amount = mode === "full" ? grandTotal : Math.round(grandTotal / 2);
    openRazorpay({
      amountInr: amount,
      name: "Arrheniux — Bulk Order",
      description: product
        ? `${product.name} × ${total} pcs (${mode === "full" ? "Full" : "50% Advance"})`
        : "Bulk",
      prefill: {
        name: customer.fullName || user.name,
        email: customer.email || user.email,
        contact: customer.phone,
      },
      onSuccess: async () => {
        setSavingOrder(true);

        try {
          const o = await persistOrder(mode, amount);
          if (o) {
            toast({
              title: "Payment received",
              description: `Order #${o.id.slice(0, 8).toUpperCase()} placed.`,
            });
            window.open(
              waLink(buildMessage(mode, amount)),
              "_blank",
              "noreferrer",
            );
            setSuccessOrder({ id: o.id, amount });
          }
          setSuccessOrder({ id: o.id, amount: grandTotal });
        } catch {
          toast({
            title: "Order failed",
            description: "Payment received but order could not be saved.",
            variant: "destructive",
          });
        } finally {
          setPayingMode(null);
          setSavingOrder(false);
        }
      },
      onDismiss: () => setPayingMode(null),
    });
  };

  const bumpSize = (s: string, d: number) =>
    setSizeQty((q) => ({
      ...q,
      [s]: Math.max(0, (q[s] || 0) + d * SIZE_STEP),
    }));

  return (
    <Layout>
      <section className="bg-secondary">
        <div className="container-x py-12 md:py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {BULK_THRESHOLD}+ pcs
          </span>
          <h1 className="font-display text-5xl md:text-7xl leading-none mt-3">
            BULK ORDER
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            For corporate, institutional and event orders of {BULK_THRESHOLD}{" "}
            pieces and above. Auto {BULK_DISCOUNT_PCT}% bulk discount, ₹
            {COURIER_PER_PC}/pc courier, 5% GST. Pay 100% or 50% advance —
            WhatsApp opens after payment for artwork.
          </p>
        </div>
      </section>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="container-x py-12 grid lg:grid-cols-[1.1fr_1fr] gap-10"
      >
        <div className="space-y-8">
          <div className="border border-border p-5 bg-card">
            <h2 className="font-condensed text-2xl tracking-wide mb-4">
              SELECT PRODUCT
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                value={catSlug}
                onChange={setCatSlug}
                options={catList.map((c) => ({ value: c.slug, label: c.name }))}
              />
              {showsTierStep && (
                <Select
                  label="Regular / Premium"
                  value={tier}
                  onChange={(v) => setTier(v as Tier | "")}
                  options={[
                    { value: "", label: "Choose tier…" },
                    ...(cat.regular?.length
                      ? [{ value: "regular", label: "Regular" }]
                      : []),
                    ...(cat.premium?.length
                      ? [{ value: "premium", label: "Premium" }]
                      : []),
                  ]}
                />
              )}
              <Select
                label="Subcategory"
                value={subSlug}
                onChange={setSubSlug}
                options={[
                  { value: "", label: "Choose subcategory…" },
                  ...subs.map((s) => ({ value: s.slug, label: s.name })),
                ]}
              />
            </div>
          </div>

          {subcat && (
            <div className="border border-border p-5 bg-card">
              <h2 className="font-condensed text-2xl tracking-wide mb-4">
                PICK A PRODUCT
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setProductId(p.id)}
                    className={`text-left bg-secondary border-2 overflow-hidden transition ${productId === p.id ? "border-ink" : "border-transparent hover:border-border"}`}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-condensed tracking-wide leading-tight">
                        {p.name.toUpperCase()}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {productCode(p)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {p.price} / pc
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product && (
            <div className="border border-border p-5 bg-card">
              <h2 className="font-condensed text-2xl tracking-wide mb-1">
                {product.name.toUpperCase()}
              </h2>
              <div className="text-[11px] font-mono text-muted-foreground">
                Code: {productCode(product)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {product.description}
              </p>

              <div className={`mt-5 grid gap-px bg-border ${isKit ? "grid-cols-1" : "grid-cols-2"}`}>
  {!isKit && (
    <div className="bg-background p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Material
      </div>
      <div className="font-medium mt-1 text-sm">
        {product.material}
      </div>
    </div>
  )}
  {!isKit && (<div className="bg-background p-3 accent-glow">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
      Price
    </div>
    <div className="font-display text-xl mt-1">
      {product.price}
      <span className="text-xs font-sans text-muted-foreground">/pc</span>
    </div>
  </div>)}
</div>

              {rule?.namedColors && (
                <div className="mt-5">
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                    Color / Variant *
                  </h4>
                  <select
                    value={namedColor || rule.namedColors[0]}
                    onChange={(e) => setNamedColor(e.target.value)}
                    className="w-full border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-ink"
                  >
                    {rule.namedColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {rule?.printColors && (
                <div className="mt-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                    Print Color
                  </h4>
                  <select
                    value={printColor || rule.printColors[0]}
                    onChange={(e) => setPrintColor(e.target.value)}
                    className="w-full border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-ink"
                  >
                    {rule.printColors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {rule?.note && (
                <p className="mt-3 text-xs italic text-muted-foreground border-l-2 border-primary pl-3">
                  Note: {rule.note}
                </p>
              )}

              {canPrint && (
                <div className="mt-5">
                  <PrintPicker
                    value={printSel}
                    onChange={setPrintSel}
                    qty={total}
                    methods={restrictedMethods}
                    freeLabel={printFreeLabel}
                    disabled={printDisabled}
                  />
                </div>
              )}

              {isKit && (
                <div className="mt-5 border border-primary/40 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Print Type: Company Logo Printing
                    </span>
                    <span className="text-[10px] font-mono uppercase text-primary">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Free Custom Tote Bag included with every Welcome Kit.
                  </p>
                </div>
              )}

              {!isArrheniuxCategory(product.categorySlug) && (
                <ArtworkUpload value={artwork} onChange={setArtwork} />
              )}

              {isKit ? (
                <div className="mt-6 space-y-5">
  <div className="border-2 border-primary/60 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 rounded-lg shadow-[0_8px_30px_-15px_hsl(var(--primary)/0.4)]">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      <h4 className="text-sm uppercase tracking-widest font-bold text-primary">
        Customize Combined Product
      </h4>
    </div>
    <p className="text-xs text-muted-foreground mb-4">
      Build your own welcome kit. Select at least{" "}
      {WELCOME_KIT_MIN_ITEMS} products.
    </p>
    <div className="grid grid-cols-2 gap-3">
                      {kitDefs.map((it)  => {
                        const checked = kitItems.includes(it.id);
                        const isTshirt = it.id === "tshirt";
                        return (
                          <label
                            key={it.id}
                            className={`flex items-center justify-between gap-2 border px-3 py-2 text-sm transition ${checked ? "border-ink bg-secondary" : "border-border"} ${isTshirt ? "" : "cursor-pointer"}`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isTshirt}
                                onChange={() => {
                                  if (isTshirt) return;
                                  setKitItems((prev) =>
                                    prev.includes(it.id)
                                      ? prev.filter((x) => x !== it.id)
                                      : [...prev, it.id],
                                  );
                                }}
                                className="h-4 w-4 accent-primary"
                              />
                              <span>
                                {isTshirt
                                  ? "Custom T-Shirt (required)"
                                  : it.label}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              ₹{it.price}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {!kitEnoughItems && (
                      <p className="text-xs text-destructive mt-2">
                        Please select at least {WELCOME_KIT_MIN_ITEMS} products.
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between border border-border px-3 py-2 bg-secondary/50">
                      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Kit Unit Price (sum of items)
                      </span>
                      <span className="font-display text-lg">₹{kitUnit}</span>
                    </div>
                  </div>

                  {kitIncludesTshirt ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold">
                          T-Shirt Sizes
                        </h4>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Total kits = total shirts ({kitSizeTotal})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SIZES.map((s) => (
                          <div
                            key={s}
                            className="flex items-center justify-between border border-border px-3 py-2"
                          >
                            <span className="font-condensed text-lg w-10">
                              {s}
                            </span>
                            <div className="inline-flex items-center border border-ink">
                              <button
                                type="button"
                                onClick={() =>
                                  setSizeQty((q) => ({
                                    ...q,
                                    [s]: Math.max(0, (q[s] || 0) - 1),
                                  }))
                                }
                                className="px-2.5 py-1.5"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={sizeQty[s]}
                                onChange={(e) =>
                                  setSizeQty((q) => ({
                                    ...q,
                                    [s]: Math.max(
                                      0,
                                      Number(e.target.value) || 0,
                                    ),
                                  }))
                                }
                                className="w-14 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSizeQty((q) => ({
                                    ...q,
                                    [s]: (q[s] || 0) + 1,
                                  }))
                                }
                                className="px-2.5 py-1.5"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                        Kit Quantity (min {WELCOME_KIT_MIN})
                      </h4>
                      <div className="flex items-center justify-between border border-border px-3 py-3">
                        <span className="font-condensed text-lg">Kits</span>
                        <div className="inline-flex items-center border border-ink">
                          <button
                            type="button"
                            onClick={() =>
                              setKitQtyManual((q) =>
                                Math.max(WELCOME_KIT_MIN, q - 1),
                              )
                            }
                            className="px-3 py-1.5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={WELCOME_KIT_MIN}
                            value={kitQtyManual}
                            onChange={(e) =>
                              setKitQtyManual(
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="w-16 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setKitQtyManual((q) => q + 1)}
                            className="px-3 py-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : isGarment ? (
                <div className="mt-5">
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                    Sizes & Quantity (step of {SIZE_STEP})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SIZES.map((s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between border border-border px-3 py-2"
                      >
                        <span className="font-condensed text-lg w-10">{s}</span>
                        <div className="inline-flex items-center border border-ink">
                          <button
                            type="button"
                            onClick={() => bumpSize(s, -1)}
                            className="px-2.5 py-1.5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            step={SIZE_STEP}
                            value={sizeQty[s]}
                            onChange={(e) =>
                              setSizeQty((q) => ({
                                ...q,
                                [s]: Math.max(0, Number(e.target.value) || 0),
                              }))
                            }
                            className="w-14 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => bumpSize(s, 1)}
                            className="px-2.5 py-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                    Quantity (min {BULK_THRESHOLD})
                  </h4>
                  <div className="flex items-center justify-between border border-border px-3 py-3">
                    <span className="font-condensed text-lg">Units</span>
                    <div className="inline-flex items-center border border-ink">
                      <button
                        type="button"
                        onClick={() =>
                          setUnitQty((q) => Math.max(SIZE_STEP, q - SIZE_STEP))
                        }
                        className="px-3 py-1.5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={BULK_THRESHOLD}
                        step={SIZE_STEP}
                        value={unitQty}
                        onChange={(e) =>
                          setUnitQty(Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-16 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setUnitQty((q) => q + SIZE_STEP)}
                        className="px-3 py-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 border border-border bg-secondary">
                <Row label="Unit Price" value={`₹${unitPrice}`} />
                <Row label="Total Quantity" value={`${total} pcs`} />
                {printCharge > 0 && (
                  <Row
                    label={`Print (${printText})`}
                    value={`+₹${printCharge}`}
                  />
                )}
                <Row
                  label="Subtotal"
                  value={`₹${subtotal.toLocaleString("en-IN")}`}
                />
                <Row
                  label={`Bulk Discount ${bulkPct}%`}
                  value={`−₹${discountAmt.toLocaleString("en-IN")}`}
                />
                <Row
                  label={
                    courierPc > 0
                      ? `Courier (₹${courierPc}×${total})`
                      : "Courier"
                  }
                  value={
                    courierPc > 0
                      ? `₹${courier.toLocaleString("en-IN")}`
                      : "FREE"
                  }
                />
                <Row
                  label={`GST ${gstPctLabel}%`}
                  value={`₹${gst.toLocaleString("en-IN")}`}
                />
                <div className="shine-sweep flex items-center justify-between px-4 py-3 bg-ink text-cream">
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Grand Total
                  </span>
                  <span className="font-display text-2xl">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Pay 100% or 50% advance. After payment, WhatsApp opens
                automatically with your order — attach logo / artwork /
                instructions there.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
         {product ? (
  <div className="tilt-card">
  <div className="tilt-card-inner bg-secondary overflow-hidden">
    <div className="aspect-square">
      <img src={product.gallery[activeImg] || product.image} alt={product.name} className="w-full h-full object-cover" />
    </div>
    <div className="grid grid-cols-4 gap-1 p-1">
      {product.gallery.slice(0, 4).map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setActiveImg(i)}
          className={`aspect-square overflow-hidden border-2 transition ${
            activeImg === i ? "border-ink" : "border-transparent hover:border-border"
          }`}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  </div>
  </div>
) : (
            <div className="bg-secondary aspect-square flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">
              Choose a product to preview
            </div>
          )}

          <div className="border border-border p-5 bg-card">
            <h2 className="font-condensed text-2xl tracking-wide mb-4">
              CUSTOMER INFORMATION
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Full Name *"
                value={customer.fullName}
                onChange={(v) => setCustomer({ ...customer, fullName: v })}
              />
              <Input
                label="Company Name *"
                value={customer.company}
                onChange={(v) => setCustomer({ ...customer, company: v })}
              />
              <Input
                label="GST Number"
                value={customer.gst}
                onChange={(v) => setCustomer({ ...customer, gst: v })}
              />
              <Input
                label="Mobile Number *"
                value={customer.phone}
                onChange={(v) => setCustomer({ ...customer, phone: v })}
              />
              <Input
                label="Email Address *"
                type="email"
                value={customer.email}
                onChange={(v) => setCustomer({ ...customer, email: v })}
              />
              <Input
                label="Pincode *"
                value={customer.pincode}
                onChange={(v) => setCustomer({ ...customer, pincode: v })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Complete Address *"
                  value={customer.address}
                  onChange={(v) => setCustomer({ ...customer, address: v })}
                />
              </div>
              <Input
                label="City *"
                value={customer.city}
                onChange={(v) => setCustomer({ ...customer, city: v })}
              />
              <Input
                label="State *"
                value={customer.state}
                onChange={(v) => setCustomer({ ...customer, state: v })}
              />
              <div className="sm:col-span-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Additional Notes
                </label>
                <textarea
                  value={customer.notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full border border-border rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-2">
            <button type="button" onClick={() => handlePay("advance-50")} disabled={!!payingMode} className="btn-bold btn-magnetic justify-center !py-3.5 text-sm disabled:opacity-50">
  {payingMode === "advance-50" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><CreditCard className="h-4 w-4" /> Pay 50% Advance</>}
</button>
<button type="button" onClick={() => handlePay("full")} disabled={!!payingMode} className="btn-bold btn-magnetic justify-center !py-3.5 text-sm disabled:opacity-50">
  {payingMode === "full" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><CreditCard className="h-4 w-4" /> Pay in Full</>}
</button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Login required before payment. WhatsApp will open with your order
            after successful payment.
          </p>
        </div>
      </form>
      <SuccessDialog
        open={!!successOrder}
        onClose={() => {
          setSuccessOrder(null);
          navigate("/my-orders");
        }}
        orderId={successOrder?.id}
        amount={successOrder?.amount}
        title="Bulk Order Confirmed!"
      />
      {savingOrder && <BrandLoader fullscreen label="Confirming your order" />}
    </Layout>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-border last:border-b-0">
    <span className="text-xs uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Input = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border rounded-none px-3 py-2 text-sm bg-background focus:outline-none focus:border-ink"
    />
  </div>
);

export default BulkOrder;
