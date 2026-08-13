import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Minus,
  Plus,
  Share2,
  Link2,
  PackageOpen,
  CreditCard,
  Star,
  Package,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { PrintPicker } from "@/components/PrintPicker";
import {
  ArtworkUpload,
  artworkSummary,
  type ArtworkFile,
} from "@/components/ArtworkUpload";
import { SampleDialog } from "@/components/SampleDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultAddress, formatAddress } from "@/lib/authStore";
import { Loader2 } from "lucide-react";
import { BrandLoader } from "@/components/BrandLoader";
import { useReveal } from "@/hooks/useReveal";
import { getKitItemDefs, kitUnitPrice } from "@/data/welcomeKit";
import {
  ARR_SIZE_MAX,
  findCategory,
  findSubcategory,
  isNonGarmentCategory,
  isArrheniuxCategory,
  priceValue,
  getDiscountPct,
  getMOQ,
  getMaxQty,
  getAccessoryRules,
  getGstPct,
  getCourierPerPc,
  productCode,
  supportsPrint,
  isWelcomeKitCategory,
  WELCOME_KIT_ITEMS,
  WELCOME_KIT_MIN,
  WELCOME_KIT_MIN_ITEMS,
  welcomeKitUnitPrice,
  getSizesFor,
  emptySizes,
  APPAREL_SIZES,
  type CatalogProduct,
} from "@/data/catalog";
import {
  emptyPrint,
  printPricePerPc,
  printLabel,
  encodePrint,
  type PrintSelection,
  type PrintMethod,
} from "@/data/printOptions";
import { waLink } from "@/data/site";
import { getSession } from "@/lib/session";
import { mapApiProductToCatalog } from "@/lib/productMappers";
import { openRazorpay } from "@/lib/razorpay";
import { toast } from "@/hooks/use-toast";
import { SuccessDialog } from "@/components/SuccessDialog";
import {
  useCreateOrder,
  useProduct,
  useProductReviews,
  useProducts,
} from "@/hooks/api";
const PDP_DRAFT_KEY = (id: string) => `arr_pdp_draft_${id}`;
const BULK_REDIRECT_DRAFT_KEY = "arr_bulk_redirect_draft"; //
type ProductDraft = {
  productId: string;
  sizeQty: Record<string, number>;
  unitQty: number;
  printSel: PrintSelection;
  kitItems: string[];
  kitQtyManual: number;
  namedColor: string;
  printColor: string;
  artwork: ArtworkFile[];
};

const loadPdpDraft = (productId: string): ProductDraft | null => {
  try {
    const raw = JSON.parse(
      localStorage.getItem(PDP_DRAFT_KEY(productId)) || "null",
    );

    if (!raw) return null;

    return raw.productId === productId ? raw : null;
  } catch {
    return null;
  }
};

const savePdpDraft = (draft: ProductDraft) => {
  localStorage.setItem(PDP_DRAFT_KEY(draft.productId), JSON.stringify(draft));
};

const clearPdpDraft = (productId: string) => {
  localStorage.removeItem(PDP_DRAFT_KEY(productId));
};
const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: apiProducts = [] } = useProducts({ status: "Active" });

  if (isLoading) {
    return (
      <Layout>
        <div className="container-x py-10 space-y-6">
          <Skeleton className="h-4 w-64" />
          <div className="grid lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container-x py-32 text-center">
          <h1 className="font-display text-4xl">Product not found</h1>
          <Link to="/" className="btn-bold mt-6 inline-flex">
            Back home
          </Link>
        </div>
      </Layout>
    );
  }

  return <ProductDetailView product={product} apiProducts={apiProducts} />;
};

const ProductDetailView = ({
  product,
  apiProducts,
}: {
  product: CatalogProduct;
  apiProducts: import("@/lib/api").ApiProduct[];
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: reviews = [] } = useProductReviews(product.id);
  const createOrderMut = useCreateOrder();

  const SIZES = getSizesFor(product.categorySlug) as readonly string[];
  type Size = string;

  const [activeImg, setActiveImg] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const draft = useMemo(() => loadPdpDraft(product.id), [product.id]);
  const [sizeQty, setSizeQty] = useState<Record<string, number>>(
    () => draft?.sizeQty ?? emptySizes(product.categorySlug),
  );
  const [unitQty, setUnitQty] = useState(draft?.unitQty ?? 1);
  const [printSel, setPrintSel] = useState<PrintSelection>(
    draft?.printSel ?? emptyPrint(),
  );
  const [artwork, setArtwork] = useState<ArtworkFile[]>(
    () => draft?.artwork ?? [],
  );
  const [sampleOpen, setSampleOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  // Welcome-kit config
  const [kitItems, setKitItems] = useState(draft?.kitItems ?? ["tshirt"]);
  const [kitQtyManual, setKitQtyManual] = useState(draft?.kitQtyManual ?? 20);
  // Named accessory color (Cap/Umbrella/Lanyard) + lanyard print color
  const [namedColor, setNamedColor] = useState(draft?.namedColor ?? "");
  const [printColor, setPrintColor] = useState(draft?.printColor ?? "");
  const [savingOrder, setSavingOrder] = useState(false);

  // Consume the saved draft exactly once. It's only ever written to storage
  // right before redirecting to /auth or /my-addresses (see handlePay below),
  // so this restores it after that specific round-trip — then wipes it so
  // simply leaving the page and coming back later does NOT bring old input back.
  useEffect(() => {
    if (draft) clearPdpDraft(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const cat = findCategory(product.categorySlug);
  const subcat = cat
    ? findSubcategory(cat, product.tier, product.subSlug)
    : undefined;
  const isGarment = !isNonGarmentCategory(product.categorySlug);
  const isKit = isWelcomeKitCategory(product.categorySlug);
  const kitDefs = useMemo(() => getKitItemDefs(product), [product]); // ADD THIS 
  const isNewCollection = product.categorySlug === "new-collection";  // ← add this 
  const ruleForPrint = getAccessoryRules(product.subSlug);
  const canPrint =
  !isNewCollection &&
    supportsPrint(product.categorySlug) ||
    ruleForPrint?.print.kind === "custom" ||
    ruleForPrint?.print.kind === "free";
  const isArr = isArrheniuxCategory(product.categorySlug);
  
  const rule = getAccessoryRules(product.subSlug);
  const moq = isKit ? WELCOME_KIT_MIN : getMOQ(product);
  const maxQty = isKit ? 80 : getMaxQty(product);
  const bulkThreshold = maxQty + 1;
  const code = productCode(product);
  const gstRate = getGstPct(product);
  const gstPctLabel = Math.round(gstRate * 100);
  const courierPerPc = getCourierPerPc(product);

  // Reviews aggregate (approved reviews from API)
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;

  // Print methods restricted per accessory rule (if any)
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
  const printDisabled = rule?.print.kind === "none";
  const printFreeLabel = rule?.print.kind === "free" ? rule.print.label : null;

  const kitIncludesTshirt = kitItems.includes("tshirt");
  const kitSizeTotal = Object.values(sizeQty).reduce((a, b) => a + b, 0);
  const kitQty = kitIncludesTshirt ? kitSizeTotal : kitQtyManual;
  const kitEnoughItems = kitItems.length >= WELCOME_KIT_MIN_ITEMS;

  const total = useMemo(() => {
    if (isKit) return kitQty;
    return isGarment ? kitSizeTotal : unitQty;
  }, [isKit, kitQty, isGarment, kitSizeTotal, unitQty]);

  const kitUnit = isKit ? kitUnitPrice(kitItems, kitDefs) : 0;
  const unitPrice = isKit ? kitUnit : priceValue(product);
  const printPerPc = canPrint
    ? printPricePerPc(printSel, restrictedMethods)
    : 0;
  const printCharge = printPerPc * total;
  const printTypeText = isKit
    ? "Company Logo Printing — FREE"
    : canPrint
      ? printLabel(printSel, restrictedMethods)
      : "N/A";
  const subtotal = unitPrice * total + printCharge;
  const discountPct = isKit || isArr ? 0 : getDiscountPct(total, product);
  const discountAmt = Math.round((subtotal * discountPct) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const courier = total * courierPerPc;
  const gst = Math.round((afterDiscount + courier) * gstRate);
  const grandTotal = afterDiscount + courier + gst;
  const isBulk = !isArr && total > maxQty;
  const meetsMoq = total >= moq;
  const canOrder = meetsMoq && total <= maxQty && (!isKit || kitEnoughItems);
  const samplePriceValue = (() => {
    const u = product.samplePrice; // ← use actual samplePrice, not priceValue()
    // const u = priceValue(product);
    const c = getCourierPerPc(product);
    const g = Math.round((u + c) * gstRate);
    return u + c + g;
  })();

  const bumpSize = useCallback(
    (s: Size, d: number) =>
      setSizeQty((q) => {
        let next = Math.max(0, (q[s] || 0) + d);
        if (isArr) {
          next = Math.min(ARR_SIZE_MAX, next);
          const others = SIZES.reduce(
            (sum, k) => sum + (k === s ? 0 : q[k] || 0),
            0,
          );
          const roomLeft = Math.max(0, ARR_SIZE_MAX - others);
          if (next > roomLeft) {
            toast({
              title: "Maximum 3 pieces",
              description:
                "ARRHENIUX orders are limited to 3 pieces per order.",
            });
            next = roomLeft;
          }
        }
        return { ...q, [s]: next };
      }),
    [isArr, SIZES],
  );

  // Color: default = first product color; named accessories override
  const selectedColor = rule?.namedColors
    ? namedColor || rule.namedColors[0]
    : product.colors[0];
  const selectedPrintColor = rule?.printColors
    ? printColor || rule.printColors[0]
    : "";

  const orderMessage = () => {
    const lines: string[] = [];
    lines.push("Hi Arrheniux, my payment is complete — here is my order:");
    lines.push("");
    lines.push("*Product Details*");
    if (cat) lines.push(`• Category: ${cat.name}`);
    if (product.tier)
      lines.push(
        `• Tier: ${product.tier === "premium" ? "Premium" : "Regular"}`,
      );
    if (subcat) lines.push(`• Subcategory: ${subcat.name}`);
    lines.push(`• Product: ${product.name}`);
    lines.push(`• Product Code: ${code}`);
    lines.push(`• Material: ${product.material}`);
    lines.push(`• Color: ${selectedColor}`);
    if (selectedPrintColor) lines.push(`• Print Color: ${selectedPrintColor}`);
    if (isKit) {
      const kitList = kitItems
        .map((id) => {
          const it = kitDefs.find((k) => k.id === id);
          return it ? `${it.label} (₹${it.price})` : null;
        })
        .filter(Boolean)
        .join(", ");
      lines.push(`• Kit Items: ${kitList}`);
      lines.push(`• Print Type: Company Logo Printing (FREE)`);
    } else if (canPrint) {
      lines.push(`• Print: ${printTypeText}`);
    }
    if (isGarment || (isKit && kitIncludesTshirt)) {
      const sizeLines = SIZES.filter((s) => sizeQty[s] > 0).map(
        (s) => `   - ${s}: ${sizeQty[s]} pcs`,
      );
      if (sizeLines.length) {
        lines.push(isKit ? "• T-Shirt Sizes:" : "• Sizes:");
        lines.push(...sizeLines);
      }
    }
    lines.push(
      isKit ? `• Total Kits: ${total}` : `• Total Quantity: ${total} pcs`,
    );
    if (!isArr) lines.push(`• Uploaded Artwork: ${artworkSummary(artwork)}`);
    lines.push("");
    lines.push("*Pricing*");
    lines.push(`• Unit Price: ₹${unitPrice}${isKit ? " (kit)" : ""}`);
    if (printCharge > 0) lines.push(`• Print Charge: ₹${printCharge}`);
    lines.push(`• Subtotal: ₹${subtotal}`);
    lines.push(`• Discount: ${discountPct}% (−₹${discountAmt})`);
    lines.push(
      courierPerPc > 0
        ? `• Courier (₹${courierPerPc} × ${total}): ₹${courier}`
        : `• Courier: FREE`,
    );
    lines.push(`• GST ${gstPctLabel}%: ₹${gst}`);
    lines.push(`• *Paid: ₹${grandTotal}*`);
    lines.push("");
    lines.push(
      "Sharing my logo / artwork / printing instructions in the next messages.",
    );
    return lines.join("\n");
  };

  // Build ?...=... payload for Bulk Order with full state preserved
  const bulkRedirectHref = () => {
  const p = new URLSearchParams();
  p.set("product", product.id);
  p.set("cat", product.categorySlug);
  if (product.tier) p.set("tier", product.tier);
  p.set("sub", product.subSlug);
  p.set("qty", String(total));
  if (selectedColor) p.set("color", selectedColor);
  if (isGarment) {
    const sz = SIZES.filter((s) => sizeQty[s] > 0)
      .map((s) => `${s}:${sizeQty[s]}`)
      .join(",");
    if (sz) p.set("sizes", sz);
  }
  const pr = encodePrint(printSel);
  if (pr) p.set("print", pr);
  return `/bulk-order?${p.toString()}`;
};

  const handlePay = useCallback(() => {
   if (isBulk) {
    try {
      localStorage.setItem(
        BULK_REDIRECT_DRAFT_KEY,
        JSON.stringify({
          productId: product.id,
          sizeQty,
          unitQty,
          printSel,
          artwork,
          kitItems,
          kitQtyManual,
          namedColor,
          printColor,
        }),
      );
    } catch {
      // storage full/unavailable — URL params still cover the basics
    }
    navigate(bulkRedirectHref());
    return;
  }
    if (!canOrder || isPaying) return;
    setIsPaying(true); // ← add
    const user = getSession();
    if (!user) {
      savePdpDraft({
        productId: product.id,
        sizeQty,
        unitQty,
        printSel,
        kitItems,
        kitQtyManual,
        namedColor,
        printColor,
        artwork,
      });

      setIsPaying(false);

      navigate(`/auth?next=${encodeURIComponent(location.pathname)}`);

      return;
    }

    // Require a saved address before checkout — no manual typing needed after first time.
    const defaultAddr = getDefaultAddress(user.id);
    if (!defaultAddr) {
      savePdpDraft({
        productId: product.id,
        sizeQty,
        unitQty,
        printSel,
        kitItems,
        kitQtyManual,
        namedColor,
        printColor,
        artwork,
      });

      setIsPaying(false);
      toast({
        title: "Add a delivery address",
        description: "Please save an address before placing your order.",
      });
      navigate(`/my-addresses?next=${encodeURIComponent(location.pathname)}`);
      return;
    }

    openRazorpay({
      amountInr: grandTotal,
      name: "Arrheniux",
      description: `${product.name} × ${total} pcs`,
      prefill: {
        name: user.name,
        email: user.email,
        contact: defaultAddr.mobile || user.phone,
      },
      onSuccess: async (paymentId) => {
        setSavingOrder(true);
        try {
          const o = await createOrderMut.mutateAsync({
            kind: "retail",
            customerId: user.id,
            customerName: user.name,
            phone: defaultAddr.mobile || user.phone || "",
            email: user.email,
            address: formatAddress(defaultAddr),
            productId: product.id,
            productCode: code,
            productName: product.name,
            category: cat?.name ?? "",
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
            printType: printTypeText,
sizes: (isGarment || (isKit && kitIncludesTshirt)) ? sizeQty : undefined,            qty: total,
            unitPrice,
            printingPrice: printCharge,
            gstPct: gstPctLabel,
            shipping: courier,
            total: grandTotal,
            paid: grandTotal,
            uploadedLogo: !isArr ? (artwork[0]?.dataUrl ?? "") : "",
            discountPct,
            discountAmt,
            paymentMode: "full",
          });
          toast({
            title: "Payment successful",
            description: `Order #${o.id.slice(0, 8).toUpperCase()} placed.`,
          });
          // window.open(waLink(orderMessage()), "_blank", "noreferrer");
          setSuccessOrder({ id: o.id, amount: grandTotal });
          clearPdpDraft(product.id);
          // setSuccessOrder({ id: o.id, amount: grandTotal });
        } catch {
          toast({
            title: "Order failed",
            description:
              "Payment received but order could not be saved. Contact support.",
            variant: "destructive",
          });
        } finally {
          setIsPaying(false); // ← add
          setSavingOrder(false);
        }
      },
      onDismiss: () => setIsPaying(false), // ← add this option (see razorpay.ts note below)
    });
  }, [
    isBulk,
    canOrder,
    grandTotal,
    product,
    total,
    code,
    unitPrice,
    subtotal,
    discountPct,
    discountAmt,
    printTypeText,
    printCharge,
    courier,
    gst,
    isGarment,
    sizeQty,
    navigate,
    location.pathname,
    cat,
    subcat,
    createOrderMut,
    gstPctLabel,
    isPaying,
  ]);

  const handleSample = useCallback(() => setSampleOpen(true), []);

  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleShareWa = useCallback(() => {
    const msg = `Check out this product from Arrheniux: ${product.name} — ${productUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noreferrer",
    );
  }, [product.name, productUrl]);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually.",
      });
    }
  }, [productUrl]);

  const related = useMemo(() => {
    if (!product) return [] as CatalogProduct[];
    return apiProducts
      .map((p) => mapApiProductToCatalog(p))
      .filter(
        (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
      )
      .slice(0, 4);
  }, [product, apiProducts]);

  return (
    <Layout>
      <section className="container-x py-10">
        <div className="text-xs uppercase text-muted-foreground tracking-wide mb-6">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>{" "}
          /{" "}
          <Link
            to={`/category/${product.categorySlug}`}
            className="hover:text-ink"
          >
            {cat?.name ?? product.categorySlug}
          </Link>{" "}
          / {product.name}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div className="flex gap-3">
            <div className="hidden md:flex flex-col gap-2 w-20">
              {product.gallery.slice(0, 6).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`bg-secondary aspect-square overflow-hidden border-2 transition ${activeImg === i ? "border-ink" : "border-transparent hover:border-border"}`}
                >
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1">
              <div className="tilt-card">
                <div className="tilt-card-inner bg-secondary aspect-square overflow-hidden">
                  <img
                    src={product.gallery[activeImg] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:hidden flex gap-2 mt-2 overflow-x-auto">
                {product.gallery.slice(0, 6).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`bg-secondary w-16 h-16 shrink-0 overflow-hidden border-2 ${activeImg === i ? "border-ink" : "border-transparent"}`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="inline-block bg-ink text-cream text-[10px] uppercase tracking-widest px-2 py-1">
              MOQ {moq}–{maxQty} pcs
            </span>
            {product.tier && (
              <span className="inline-block ml-2 bg-primary text-cream text-[10px] uppercase tracking-widest px-2 py-1">
                {product.tier}
              </span>
            )}
            {rule?.oem && (
              <span className="inline-block ml-2 bg-secondary text-ink border border-border text-[10px] uppercase tracking-widest px-2 py-1">
                OEM Brand
              </span>
            )}
            <h1 className="font-display text-4xl md:text-6xl leading-none mt-4">
              {product.name.toUpperCase()}
            </h1>

            {/* Code + rating */}
            <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1">
              <div className="text-[11px] font-mono text-muted-foreground">
                Code: {code}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= Math.round(avgRating) ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {reviewCount
                    ? `${avgRating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-muted-foreground">{product.description}</p>

            <div
              className={`mt-5 grid gap-px bg-border ${isKit ? "grid-cols-1" : "grid-cols-2"}`}
            >
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
              {!isKit && (
                <div className="bg-background p-3 accent-glow">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Price
                  </div>
                  <div className="font-display text-xl mt-1">
                    {product.price}
                    <span className="text-xs font-sans text-muted-foreground">
                      /pc
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Discount notice / Free tote banner for Welcome Kits */}
            {isKit ? (
              <div className="mt-5 border-2 border-primary bg-primary/10 p-4">
                <div className="text-[11px] uppercase tracking-widest font-bold text-primary mb-1">
                  Complimentary
                </div>
                <p className="text-sm font-semibold text-ink">
                  Free Custom Tote Bag Included with Every Welcome Kit
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Kit MOQ: {WELCOME_KIT_MIN} · Max {maxQty}. Above {maxQty}{" "}
                  kits, order through Bulk Order.
                </p>
              </div>
            ) : !isArr ? (
              <div className="mt-5 border border-border bg-secondary/60 p-4">
                <div className="text-[11px] uppercase tracking-widest font-bold text-primary mb-2">
                  Quantity Discount Policy
                </div>
                {rule && !rule.discountEnabled ? (
                  <p className="text-sm text-muted-foreground">
                    No quantity discount on this product.
                  </p>
                ) : (
                  <ul className="text-xs space-y-1 text-ink/80">
                    <li>• 5–9 pieces → No Discount</li>
                    <li>• 10–24 pieces → 10% Discount</li>
                    <li>• 25–49 pieces → 20% Discount</li>
                    <li>• 50–80 pieces → 30% Discount</li>
                    <li>• 80+ pieces → 40% Discount (Bulk Order only)</li>
                  </ul>
                )}
                <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
                  Minimum Order Quantity: {moq} pcs · Maximum Order Quantity:{" "}
                  {maxQty} pcs
                  <br />
                  If you need more than {maxQty} pieces, please place your order
                  through the Bulk Order section.
                </div>
              </div>
            ) : null }

            {/* Named color choice (Cap / Umbrella / Event Lanyard) */}
            {rule?.namedColors && (
              <div className="mt-6">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-3">
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

            {/* Lanyard print color */}
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

            {/* Print type — hidden for kits (kits show "Logo Printing FREE" implicit) */}
            {canPrint && !isKit && !isNewCollection && (
              <div className="mt-6">
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
              <div className="mt-6">
                <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                  Print Type
                </h4>
                <div className="border border-border bg-secondary/40 px-3 py-2.5 text-sm flex items-center justify-between">
                  <span>Company Logo Printing</span>
                  <span className="text-[10px] font-mono uppercase text-primary">
                    FREE
                  </span>
                </div>
              </div>
            )}

            {/* Upload artwork — hidden for ARRHENIUX */}
            {!isArr && !isNewCollection && <ArtworkUpload value={artwork} onChange={setArtwork} />}

            {/* Quantity / Kit builder */}
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
                          className={`flex items-center justify-between gap-2 border-2 px-4 py-3 text-sm rounded-md transition-all duration-200 ${checked ? "border-primary bg-primary/10 shadow-sm scale-[1.02]" : "border-border hover:border-primary/40 hover:bg-secondary/50"} ${isTshirt ? "opacity-100" : "cursor-pointer"}`}
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
                    <div>
                      <span className="font-display text-lg">₹{kitUnit}</span>
                      <span className="text-xs font-sans text-muted-foreground">
                        /pc
                      </span>
                    </div>
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
                          <span className="font-condensed text-xl w-10">
                            {s}
                          </span>
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
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                      Kit Quantity *
                    </h4>
                    <div className="flex items-center justify-between border border-border px-3 py-3">
                      <span className="font-condensed text-xl">Kits</span>
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
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold">
                    Sizes & Quantity
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {isArr
                      ? `Max ${ARR_SIZE_MAX} pcs per order`
                      : `MOQ ${moq} · ${maxQty}+ goes to Bulk`}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SIZES.map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between border border-border px-3 py-2"
                    >
                      <span className="font-condensed text-xl w-10">{s}</span>
                      <div className="inline-flex items-center border border-ink">
                        <button
                          type="button"
                          onClick={() => bumpSize(s, -1)}
                          className="px-2.5 py-1.5"
                          aria-label={`Decrease ${s}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={isArr ? ARR_SIZE_MAX : undefined}
                          value={sizeQty[s]}
                          onChange={(e) => {
                            let v = Math.max(0, Number(e.target.value) || 0);
                            if (isArr) {
                              v = Math.min(ARR_SIZE_MAX, v);
                              const others = SIZES.reduce(
                                (sum, k) =>
                                  sum + (k === s ? 0 : sizeQty[k] || 0),
                                0,
                              );
                              const roomLeft = Math.max(
                                0,
                                ARR_SIZE_MAX - others,
                              );
                              if (v > roomLeft) {
                                toast({
                                  title: "Maximum 3 pieces",
                                  description:
                                    "ARRHENIUX orders are limited to 3 pieces per order.",
                                });
                                v = roomLeft;
                              }
                            }
                            setSizeQty((q) => ({ ...q, [s]: v }));
                          }}
                          className="w-14 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => bumpSize(s, 1)}
                          className="px-2.5 py-1.5"
                          aria-label={`Increase ${s}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold">
                    Quantity
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    MOQ {moq} · {maxQty}+ goes to Bulk
                  </span>
                </div>
                <div className="flex items-center justify-between border border-border px-3 py-3">
                  <span className="font-condensed text-xl">Units</span>
                  <div className="inline-flex items-center border border-ink">
                    <button
                      type="button"
                      onClick={() => setUnitQty((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={unitQty}
                      onChange={(e) =>
                        setUnitQty(Math.max(0, Number(e.target.value) || 0))
                      }
                      className="w-16 text-center text-sm bg-transparent border-x border-ink py-1.5 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setUnitQty((q) => q + 1)}
                      className="px-3 py-1.5"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing breakdown */}
            <div className="mt-5 border border-border bg-secondary">
              <Row label="Product Price" value={`₹${unitPrice} / pc`} />
              <Row label="Quantity" value={`${total} pcs`} />
              {printCharge > 0 && (
                <Row
                  label={`Print (${printTypeText})`}
                  value={`+₹${printCharge}`}
                />
              )}
              <Row label="Subtotal" value={`₹${subtotal}`} />
              <Row
                label="Discount"
                value={
                  discountPct > 0 ? `${discountPct}% (−₹${discountAmt})` : "—"
                }
              />
              <Row
                label={
                  courierPerPc > 0
                    ? `Courier (₹${courierPerPc}×${total})`
                    : "Courier"
                }
                value={courierPerPc > 0 ? `₹${courier}` : "FREE"}
              />
              <Row label={`GST ${gstPctLabel}%`} value={`₹${gst}`} />
              <div className="shine-sweep flex items-center justify-between px-4 py-3 bg-ink text-cream">
                <span className="text-xs uppercase tracking-widest font-bold">
                  Final Total
                </span>
                <span className="font-display text-2xl">₹{grandTotal}</span>
              </div>
            </div>

            {!meetsMoq && total > 0 && (
              <p className="text-xs text-destructive mt-2">
                Minimum order quantity is {moq} pcs.
              </p>
            )}
            {isArr && total >= ARR_SIZE_MAX && (
              <p className="text-xs text-primary font-semibold mt-2">
                Maximum order quantity for ARRHENIUX is {ARR_SIZE_MAX} pieces
                per order.
              </p>
            )}

            {isBulk ? (
              <button
                onClick={handlePay}
                className="btn-bold mt-6 w-full justify-center text-base !py-4"
              >
                <PackageOpen className="h-5 w-5" /> Continue on Bulk Order page
                ({maxQty}+ pcs)
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={!canOrder || isPaying}
                className={`btn-bold btn-magnetic mt-6 w-full justify-center text-sm !py-3.5 ${!canOrder || isPaying ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Pay Now (Razorpay)
                  </>
                )}
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Complete payment first. WhatsApp will auto-open with your order —
              attach logo, artwork or instructions there.
            </p>

            {/* Sample — hidden for ARRHENIUX products and new collection*/}
            {!isArr && !isNewCollection && (
              <button
                onClick={handleSample}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-ink py-3 text-xs uppercase tracking-widest font-semibold hover:bg-ink hover:text-cream transition"
              >
                <Package className="h-4 w-4" /> Order Sample Product — ₹
                {samplePriceValue}
              </button>
            )}

            {/* Share */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleShareWa}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border py-2.5 text-xs uppercase tracking-wide hover:border-ink transition"
              >
                <Share2 className="h-4 w-4" /> Share via WhatsApp
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border py-2.5 text-xs uppercase tracking-wide hover:border-ink transition"
              >
                <Link2 className="h-4 w-4" /> Copy Product Link
              </button>
            </div>
          </div>
        </div>

        {/* Product info sections */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <InfoBlock title="Product Overview">
            <p>
              {product.overview?.trim() ||
                `${product.name} is engineered for corporate, institutional and event orders...`}
            </p>
          </InfoBlock>
          <InfoBlock title="Product Specifications">
            <ul className="space-y-1 list-disc pl-4">
              {(product.specifications?.length
                ? product.specifications
                : [`Material: ${product.material}`, `Build: ${product.gsm}`]
              ).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </InfoBlock>
          {!isKit && (
            <>
              <InfoBlock title="Design Guidelines">
                <ul className="space-y-1 list-disc pl-4">
                  {(product.designGuidelines?.length
                    ? product.designGuidelines
                    : ["Submit artwork in vector or 300 DPI PNG."]
                  ).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </InfoBlock>
              <InfoBlock title="Wash Care Instructions">
                <ul className="space-y-1 list-disc pl-4">
                  {(product.washCare?.length
                    ? product.washCare
                    : ["Machine wash cold. Do not bleach."]
                  ).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </InfoBlock>
            </>
          )}
        </div>
      </section>

      <ProductReviews productId={product.id} />

      {related.length > 0 && (
        <section className="container-x py-16">
          <h2 className="font-display text-4xl md:text-5xl mb-8">
            RELATED PRODUCTS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} p={p as any} />
            ))}
          </div>
        </section>
      )}

      <SampleDialog
        product={product}
        open={sampleOpen}
        onClose={() => setSampleOpen(false)}
        isGarment={isGarment}
      />
      <SuccessDialog
        open={!!successOrder}
        onClose={() => {
          setSuccessOrder(null);
          navigate("/");
        }}
        orderId={successOrder?.id}
        amount={successOrder?.amount}
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

const InfoBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border border-border p-5 bg-card">
    <h3 className="font-condensed text-xl tracking-wide mb-3">
      {title.toUpperCase()}
    </h3>
    <div className="text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </div>
);

export default ProductDetail;
