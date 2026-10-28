import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Minus,
  Plus,
  CreditCard,
  ChevronLeft,
  Package,
  LogOut,
  CheckCircle2,
  Home,
 
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { PrintPicker } from "@/components/PrintPicker";
import { SampleDialog } from "@/components/SampleDialog";
import { Loader2 } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { BrandLoader } from "@/components/BrandLoader";
import {
  B2B_SUBCATEGORIES,
  getB2BProducts, // ← add this
  priceValue,
  productCode,
  BULK_DISCOUNT_PCT,
  B2B_MOQ,
  B2B_STEP,
  supportsPrint,
  B2B_SHOP_BANNER,
  type CatalogProduct,
} from "@/data/catalog";
import {
  emptyPrint,
  printPricePerPc,
  printLabel,
  type PrintSelection,
} from "@/data/printOptions";
import { waLink } from "@/data/site";
import { openRazorpay } from "@/lib/razorpay";
import { toast } from "@/hooks/use-toast";
import {
  useB2BProducts,
  useCreateOrder,
  useRegisterAgent,
  useVerifyAgentCode,
  type AgentRegistrationResult,
} from "@/hooks/api";
import {
  saveB2BAgentSession,
  loadB2BAgentSession,
  clearB2BAgentSession,
} from "@/lib/b2bAgentSession";
import { ProductReviews } from "@/components/ProductReviews";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { validateCoupon } from "@/lib/api";
import { slugify } from "@/lib/productMappers";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
type Size = (typeof SIZES)[number];
const EMPTY_SIZES: Record<Size, number> = {
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
  "3XL": 0,
};

type View =
  | { step: "subs" }
  | { step: "products"; subSlug: string }
  | { step: "detail"; subSlug: string; productId: string };

const AGENT_CODES = ["AGENT2024", "ARR-B2B", "DEALER100"];

// How often to poll for silent session expiry while the tab stays open.
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

type AgentForm = {
  company: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};
const EMPTY_AGENT: AgentForm = {
  company: "",
  contactPerson: "",
  mobile: "",
  email: "",
  gst: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const B2BShop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createOrderMut = useCreateOrder();
  const registerAgentMut = useRegisterAgent();
  const { verify, isLoading: agentsLoading } = useVerifyAgentCode();
  const { products: allB2BProducts, isLoading: countsLoading } = useB2BProducts();
  const [view, setView] = useState<View>({ step: "subs" });
  const [sizeQty, setSizeQty] = useState<Record<Size, number>>({
    ...EMPTY_SIZES,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [printSel, setPrintSel] = useState<PrintSelection>(emptyPrint());
  // Verification restored from sessionStorage on mount if a valid, unexpired
  // session exists; otherwise it starts fresh (agent must re-verify).
  const [gateStep, setGateStep] = useState<"code" | "form">("code");
  const [verifiedCode, setVerifiedCode] = useState<string>("");
  const [agent, setAgent] = useState<AgentRegistrationResult | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [agentForm, setAgentForm] = useState<AgentForm>(EMPTY_AGENT);
  const [gateError, setGateError] = useState("");
  const [sampleOpen, setSampleOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: "fixed" | "percent";
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [successOrder, setSuccessOrder] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  // Restore verified agent session on mount (survives refresh, expires after 1hr,
  // and clears automatically when the tab/browser is closed).
  useEffect(() => {
    const restored = loadB2BAgentSession();
    if (restored) {
      setAgent(restored.agent);
      setVerifiedCode(restored.verifiedCode);
      setGateStep("form");
    }
    setRestoringSession(false);
  }, []);
  // Push an initial history entry for the "subs" step so back button has
  // something to land on instead of leaving the page.
  useEffect(() => {
    window.history.replaceState({ view: { step: "subs" } }, "");
  }, []);

  // Listen for browser back/forward and sync our internal view state to it.
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.view) {
        setView(e.state.view);
      } else {
        setView({ step: "subs" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Poll for mid-tab expiry (agent leaves tab open past the 1hr TTL without
  // refreshing) so they aren't silently trusted past the cutoff.
  useEffect(() => {
    if (!agent) return;
    const interval = setInterval(() => {
      const current = loadB2BAgentSession();
      if (!current) {
        toast({
          title: "Session expired",
          description:
            "Your agent verification expired after 1 hour. Please re-verify to continue.",
        });
        setAgent(null);
        setVerifiedCode("");
        setGateStep("code");
        setCodeInput("");
        setAgentForm(EMPTY_AGENT);
        setView({ step: "subs" });
      }
    }, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [agent]);

  const exitAndSwitchAgent = () => {
    clearB2BAgentSession();
    setAgent(null);
    setVerifiedCode("");
    setGateStep("code");
    setCodeInput("");
    setAgentForm(EMPTY_AGENT);
    setGateError("");
    setView({ step: "subs" });
    resetSelections();
  };

  const verifyCode = () => {
    const val = codeInput.trim().toUpperCase();
    if (!val) return setGateError("Please enter your Marketing Agent Code.");
    if (agentsLoading) return setGateError("Loading agent codes…");
    const matched = verify(val);
    if (!matched && !AGENT_CODES.includes(val))
      return setGateError("Invalid marketing agent code.");
    setVerifiedCode(val);
    setGateError("");
    setGateStep("form");
  };

  const submitRegistration = async () => {
    const req: (keyof AgentForm)[] = [
      "company",
      "contactPerson",
      "mobile",
      "email",
      "gst",
      "address",
      "city",
      "state",
      "pincode",
    ];
    for (const k of req)
      if (!agentForm[k].trim())
        return setGateError("Please complete all fields.");
    try {
      const matched = verify(verifiedCode);
      const reg = await registerAgentMut.mutateAsync({
        code: verifiedCode,
        ...agentForm,
        existingAgentId: matched?.id,
      });
      setAgent(reg);
      saveB2BAgentSession(reg, verifiedCode);
      setGateError("");
    } catch {
      setGateError("Registration failed. Check your connection.");
    }
  };

  const verified = agent !== null;
  useEffect(() => {
    if (!verified) return;
    const sub = searchParams.get("sub");
    if (
      sub &&
      B2B_SUBCATEGORIES.find((s) => s.slug === sub) &&
      view.step === "subs"
    ) {
      pushView({ step: "products", subSlug: sub });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);
  useLockBodyScroll(!verified && !restoringSession); // ← add this line
  // locks scroll while the verification gate is shown
  const activeSub =
    view.step !== "subs"
      ? B2B_SUBCATEGORIES.find((s) => s.slug === view.subSlug)
      : null;
  const {
    products: b2bProductsForSub,
    refetch: refetchB2B,
    isFetching: refreshingB2B,
  } = useB2BProducts(activeSub?.name);
  const countForSub = (subName: string) =>
  allB2BProducts.filter(
    (p) =>
      p.subSlug === slugify(subName)
  ).length;
  const products = view.step !== "subs" ? b2bProductsForSub : [];
  const product: CatalogProduct | undefined =
    view.step === "detail"
      ? products.find((p) => p.id === view.productId)
      : undefined;
  useEffect(() => {
  if (!product) {
    setSelectedImage(null);
    return;
  }

  const firstImage =
    product.gallery?.filter(Boolean)?.[0] || product.image;

  setSelectedImage(firstImage);
}, [product?.id]);
  const canPrint = product ? supportsPrint(product.categorySlug) : false;

  // const total = useMemo(
  //   () => Object.values(sizeQty).reduce((a, b) => a + b, 0),
  //   [sizeQty],
  // );
  // const unitPrice = product ? priceValue(product) : 0;
  // const perPcPrint = canPrint ? printPricePerPc(printSel) : 0;
  // const printCharge = perPcPrint * total;
  // const printText = canPrint ? printLabel(printSel) : "N/A";
  // const subtotal = unitPrice * total + printCharge;
  // const discountAmt = Math.round((subtotal * BULK_DISCOUNT_PCT) / 100);
  // const afterDiscount = Math.max(0, subtotal - discountAmt);
  // const courier = 0;
  // const gst = Math.round((afterDiscount + courier) * 0.05);
  // const grandTotal = afterDiscount + courier + gst;

    const total = useMemo(
    () => Object.values(sizeQty).reduce((a, b) => a + b, 0),
    [sizeQty],
  );

  const baseUnitPrice = product ? priceValue(product) : 0;

  let couponOffPerUnit = 0;
  if (appliedCoupon && baseUnitPrice > 0) {
    if (appliedCoupon.discountType === "fixed") {
      couponOffPerUnit = Math.min(appliedCoupon.discountValue, baseUnitPrice);
    } else {
      couponOffPerUnit = Math.round(
        (baseUnitPrice * appliedCoupon.discountValue) / 100,
      );
    }
  }

  const unitPrice = Math.max(0, baseUnitPrice - couponOffPerUnit);
  const couponLineDiscount = couponOffPerUnit * total;

  const perPcPrint = canPrint ? printPricePerPc(printSel) : 0;
  const printCharge = perPcPrint * total;
  const printText = canPrint ? printLabel(printSel) : "N/A";

  const productLineTotal = unitPrice * total;
  const subtotal = productLineTotal + printCharge;

  // Existing B2B % discount (after unit coupon)
  const b2bDiscountAmt = Math.round((subtotal * BULK_DISCOUNT_PCT) / 100);
  const discountAmt = b2bDiscountAmt + couponLineDiscount;

  const afterDiscount = Math.max(0, subtotal - b2bDiscountAmt);
  const courier = 0;
  const gst = Math.round((afterDiscount + courier) * 0.05);
  const grandTotal = afterDiscount + courier + gst;


  const bumpSize = (s: Size, d: number) =>
    setSizeQty((q) => ({ ...q, [s]: Math.max(0, (q[s] || 0) + d * B2B_STEP) }));

  const resetSelections = () => {
    setSizeQty({ ...EMPTY_SIZES });
    setPrintSel(emptyPrint());
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setShowCoupon(false);
  };

  const openProduct = (id: string) => {
    resetSelections();
    pushView({
      step: "detail",
      subSlug: (view as { subSlug: string }).subSlug,
      productId: id,
    });
  };
  const pushView = (v: View) => {
    setView(v);
    window.history.pushState({ view: v }, "");
  };

  const buildMessage = () => {
    if (!product) return "";
    const lines: string[] = [];
    lines.push("Hi Arrheniux, my payment is complete — *B2B ORDER*:");
    lines.push("");
    lines.push("*Product Details*");
    lines.push(`• B2B Subcategory: ${activeSub?.name}`);
    lines.push(`• Product: ${product.name}`);
    lines.push(`• Code: ${productCode(product)}`);
    if (agent) lines.push(`• Agent Code: ${agent.code} · ${agent.company}`);
    if (canPrint) lines.push(`• Print: ${printText}`);
    lines.push("• Sizes:");
    SIZES.filter((s) => sizeQty[s] > 0).forEach((s) =>
      lines.push(`   - ${s}: ${sizeQty[s]} pcs`),
    );
    lines.push(`• Total: ${total} pcs`);
    lines.push("");
    lines.push("*Pricing*");
    lines.push(`• Unit Price: ₹${unitPrice}`);
    if (printCharge > 0) lines.push(`• Print Charge: ₹${printCharge}`);
    lines.push(`• Subtotal: ₹${subtotal}`);
    lines.push(`• B2B Discount ${BULK_DISCOUNT_PCT}%: −₹${discountAmt}`);
    lines.push(`• Courier: FREE`);
    lines.push(`• GST 5%: ₹${gst}`);
    lines.push(`• *Paid: ₹${grandTotal}*`);
    lines.push("");
    lines.push(
      "Sharing logo / artwork / printing instructions in the next messages.",
    );
    return lines.join("\n");
  };


    const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    if (!product || total <= 0) {
      setCouponError("Select sizes / quantity first");
      return;
    }

    const cartForValidate = baseUnitPrice * total;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await validateCoupon(couponCode.trim(), cartForValidate);
      if (!res.valid || !res.coupon) {
        setAppliedCoupon(null);
        setCouponError(res.message || "Invalid coupon");
        return;
      }
      setAppliedCoupon({
        code: res.coupon.code,
        discountType: res.coupon.discountType,
        discountValue: res.coupon.discountValue,
      });
      setCouponError("");
      toast({
        title: "Coupon applied",
        description:
          res.coupon.discountType === "fixed"
            ? `₹${res.coupon.discountValue} off product price per piece`
            : `${res.coupon.discountValue}% off product price`,
      });
    } catch {
      setAppliedCoupon(null);
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePay = () => {
    if (!product || !agent || isPaying) return;
    if (total < B2B_MOQ) return;
    setIsPaying(true);
    openRazorpay({
      amountInr: grandTotal,
      name: "Arrheniux — B2B",
      description: `${product.name} × ${total} pcs`,
      prefill: {
        name: agent.contactPerson,
        email: agent.email,
        contact: agent.mobile,
      },
      onSuccess: async () => {
        setSavingOrder(true);

        try {
          const o = await createOrderMut.mutateAsync({
            kind: "b2b",
            customerId: null,
            customerName: agent.contactPerson,
            phone: agent.mobile,
            email: agent.email,
            address: `${agent.address}, ${agent.city}, ${agent.state} - ${agent.pincode}`,
            productId: product.id,
            productCode: productCode(product),
            productName: product.name,
            subCategory: activeSub?.name ?? "",
            material: product.material,
            printType: printText,
            sizes: sizeQty,
            qty: total,
            unitPrice: baseUnitPrice,
            printingPrice: printCharge,
            gstPct: 5,
            shipping: courier,
            discountPct: BULK_DISCOUNT_PCT,
            discountAmt,
            couponCode: appliedCoupon?.code ?? null,
            couponDiscount: couponLineDiscount,
            total: grandTotal,
            paid: grandTotal,
            paymentMode: "full",
          });
          toast({
            title: "Payment successful",
            description: `B2B order #${o.id.slice(0, 8).toUpperCase()} placed.`,
          });
          window.open(waLink(buildMessage()), "_blank", "noreferrer");
          navigate("/");
          setSuccessOrder({ id: o.id, amount: grandTotal });
        } catch {
          toast({
            title: "Order failed",
            description: "Payment received but order could not be saved.",
            variant: "destructive",
          });
        } finally {
          setIsPaying(false);
          setSavingOrder(false);
        }
      },
      onDismiss: () => setIsPaying(false),
    });
  };

  //   const handlePay = () => {
  //   if (!product || !agent || isPaying) return;

  //   if (total < B2B_MOQ) return;

  //   setIsPaying(true);

  //   openRazorpay({
  //     amountInr: grandTotal,

  //     name: "Arrheniux — B2B",

  //     description: `${product.name} × ${total} pcs`,

  //     prefill: {
  //       name: agent.contactPerson,
  //       email: agent.email,
  //       contact: agent.mobile,
  //     },

  //     // IMPORTANT:
  //     // This data goes to the backend AFTER successful Razorpay payment.
  //     // The backend verifies the payment signature and creates the order.
  //     orderPayload: {
  //       kind: "b2b",

  //       customerId: null,

  //       customerName: agent.contactPerson,

  //       phone: agent.mobile,

  //       email: agent.email,

  //       address: `${agent.address}, ${agent.city}, ${agent.state} - ${agent.pincode}`,

  //       // B2B Agent Information
  //       agentId: agent.id,

  //       agentCode: agent.code,

  //       companyName: agent.company,

  //       gstNumber: agent.gst,

  //       productId: product.id,

  //       productCode: productCode(product),

  //       productName: product.name,

  //       category: product.categorySlug ?? "",

  //       subCategory: activeSub?.name ?? "",

  //       material: product.material,

  //       description: product.description ?? "",

  //       printType: printText,

  //       sizes: sizeQty,

  //       qty: total,

  //       unitPrice,

  //       printingPrice: printCharge,

  //       gstPct: 5,

  //       shipping: courier,

  //       total: grandTotal,

  //       paid: grandTotal,

  //       paymentMode: "full",
  //     },

  //     // Backend has already verified payment and created the order.
  //     onSuccess: (order) => {
  //       toast({
  //         title: "Payment successful",
  //         description: `B2B order #${order.id
  //           .slice(0, 8)
  //           .toUpperCase()} placed successfully.`,
  //       });

  //       window.open(
  //         waLink(buildMessage()),
  //         "_blank",
  //         "noreferrer",
  //       );

  //       setSuccessOrder({
  //         id: order.id,
  //         amount: order.totalAmount ?? grandTotal,
  //       });

  //       setIsPaying(false);
  //       setSavingOrder(false);

  //       // navigate("/");
  //     },

  //     onDismiss: () => {
  //       setIsPaying(false);
  //       setSavingOrder(false);
  //     },
  //   });
  // };

  // Avoid a flash of the verification gate while we check sessionStorage.
  if (restoringSession) {
    return (
      <Layout>
        <section className="container-x py-16 min-h-[60vh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Loading…
          </p>
        </section>
      </Layout>
    );
  }

  if (!verified) {
    return (
      <Layout>
        <section className="container-x py-16 min-h-[60vh] flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-lg border border-border bg-card p-6 shadow-sm animate-scale-in">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              B2B Access
            </span>
            <h1 className="font-display text-3xl mt-2 leading-none">
              {gateStep === "code"
                ? "VERIFY TO CONTINUE"
                : "AGENT REGISTRATION"}
            </h1>
            {gateStep === "code" ? (
              <>
                <p className="text-sm text-muted-foreground mt-3">
                  B2B Shop is restricted to verified marketing agents. Please
                  enter your Marketing Agent Code to continue.
                </p>
                <label className="block mt-5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Marketing Agent Code *
                </label>
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder=""
                  className="mt-1 w-full border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-ink"
                />
                {gateError && (
                  <p className="text-xs text-destructive mt-2">{gateError}</p>
                )}
                <button
                  onClick={verifyCode}
                  className="btn-bold mt-4 w-full justify-center !py-3"
                >
                  Verify Agent Code
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mt-3">
                  Agent verified:{" "}
                  <span className="font-semibold text-ink">{verifiedCode}</span>
                  . Complete registration to place B2B orders (no user login
                  required).
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <GateField
                    label="Company Name *"
                    value={agentForm.company}
                    onChange={(v) => setAgentForm({ ...agentForm, company: v })}
                  />
                  <GateField
                    label="Contact Person *"
                    value={agentForm.contactPerson}
                    onChange={(v) =>
                      setAgentForm({ ...agentForm, contactPerson: v })
                    }
                  />
                  <GateField
                    label="Mobile *"
                    value={agentForm.mobile}
                    onChange={(v) => setAgentForm({ ...agentForm, mobile: v })}
                  />
                  <GateField
                    label="Email *"
                    value={agentForm.email}
                    onChange={(v) => setAgentForm({ ...agentForm, email: v })}
                  />
                  <GateField
                    label="GST Number *"
                    value={agentForm.gst}
                    onChange={(v) => setAgentForm({ ...agentForm, gst: v })}
                  />
                  <GateField
                    label="Pincode *"
                    value={agentForm.pincode}
                    onChange={(v) => setAgentForm({ ...agentForm, pincode: v })}
                  />
                  <div className="sm:col-span-2">
                    <GateField
                      label="Business Address *"
                      value={agentForm.address}
                      onChange={(v) =>
                        setAgentForm({ ...agentForm, address: v })
                      }
                    />
                  </div>
                  <GateField
                    label="City *"
                    value={agentForm.city}
                    onChange={(v) => setAgentForm({ ...agentForm, city: v })}
                  />
                  <GateField
                    label="State *"
                    value={agentForm.state}
                    onChange={(v) => setAgentForm({ ...agentForm, state: v })}
                  />
                </div>
                {gateError && (
                  <p className="text-xs text-destructive mt-2">{gateError}</p>
                )}
                <button
                  onClick={submitRegistration}
                  className="btn-bold mt-4 w-full justify-center !py-3"
                >
                  Complete Registration & Enter B2B Shop
                </button>
                <button
                  onClick={() => {
                    setGateStep("code");
                    setGateError("");
                  }}
                  className="mt-2 w-full text-center text-[11px] uppercase tracking-widest text-muted-foreground hover:text-ink transition"
                >
                  ← Back to code entry
                </button>
              </>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative overflow-hidden">
  <img
    src={activeSub?.banner || B2B_SHOP_BANNER}
    alt={activeSub?.name || "B2B Shop"}
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/30" />
        <div className="container-x py-16 md:py-24 min-h-[280px] md:min-h-[380px] flex flex-col justify-center relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cream/70">
                {activeSub ? "B2B · Subcategory" : "B2B"}
              </span>
             <h1 className="font-display text-5xl md:text-7xl leading-none mt-2 text-cream">
                {activeSub ? activeSub.name.toUpperCase() : "B2B SHOP"}
              </h1>
             <p className="mt-3 max-w-2xl text-cream/80">
                {activeSub
                  ? `${products.length} product${products.length === 1 ? "" : "s"} available · MOQ ${B2B_MOQ} pcs · steps of ${B2B_STEP} · auto ${BULK_DISCOUNT_PCT}% bulk discount`
                  : `Wholesale storefront for corporate buyers. Minimum order ${B2B_MOQ} pieces per product · quantities in steps of ${B2B_STEP} · auto ${BULK_DISCOUNT_PCT}% bulk discount · Courier FREE · 5% GST.`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-xs text-cream/80">
  Verified as{" "}
  <span className="font-semibold text-cream">
                  {agent?.contactPerson}
                </span>{" "}
                · {agent?.company}
              </div>
              <button
                onClick={exitAndSwitchAgent}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-cream bg-destructive/90 hover:bg-destructive px-3.5 py-2 rounded-full transition shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" /> Exit / Switch Agent
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        {view.step === "subs" && (
          <>
            <h2 className="font-condensed text-3xl tracking-wide mb-6">
              CHOOSE A SUBCATEGORY
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {B2B_SUBCATEGORIES.map((s) => (
                <button
                  key={s.slug}
                  onClick={() =>
                    pushView({ step: "products", subSlug: s.slug })
                  }
                  className="text-left border border-border bg-card overflow-hidden hover:border-ink transition group"
                >
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-condensed text-lg tracking-wide">
                      {s.name.toUpperCase()}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
  {countsLoading
    ? "…"
    : `${countForSub(s.name)} ${countForSub(s.name) === 1 ? "product" : "products"}`}
</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {view.step === "products" && (
          <>
            <button
              onClick={() => window.history.back()}
              className="text-xs uppercase tracking-widest inline-flex items-center gap-1 mb-4 hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> All subcategories
            </button>
            <h2 className="font-condensed text-3xl tracking-wide mb-6">
              {activeSub?.name.toUpperCase()}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p.id)}
                  className="text-left border border-border bg-card overflow-hidden hover:border-ink transition group"
                >
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-condensed text-sm tracking-wide leading-tight line-clamp-2">
                      {p.name.toUpperCase()}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      {productCode(p)}
                    </div>
                    <div className="font-display text-lg mt-1">
                      {p.price}
                      <span className="text-[10px] text-muted-foreground">
                        /pc
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {view.step === "detail" && product && (
          <>
            <button
              onClick={() => window.history.back()}
              className="text-xs uppercase tracking-widest inline-flex items-center gap-1 mb-4 hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back to {activeSub?.name}
            </button>
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
              {/* <div className="tilt-card">
                <div className="tilt-card-inner bg-secondary aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div> */}

              <div className="grid grid-cols-[80px_1fr] gap-3">
  {/* Image thumbnails */}
  <div className="flex flex-col gap-2">
    {(product.gallery?.filter(Boolean).length
      ? product.gallery.filter(Boolean)
      : [product.image]
    ).map((img, index) => (
      <button
        key={`${img}-${index}`}
        type="button"
        onClick={() => setSelectedImage(img)}
        className={`aspect-square overflow-hidden border-2 bg-secondary transition ${
          selectedImage === img
            ? "border-ink"
            : "border-border hover:border-ink/50"
        }`}
      >
        <img
          src={img}
          alt={`${product.name} ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </button>
    ))}
  </div>

  {/* Main image */}
  <div className="tilt-card">
    <div className="tilt-card-inner bg-secondary aspect-square overflow-hidden">
      <img
        src={selectedImage || product.image}
        alt={product.name}
        className="w-full h-full object-cover"
      />
    </div>
  </div>
</div>


              <div>
                <span className="inline-block bg-ink text-cream text-[10px] uppercase tracking-widest px-2 py-1">
                  MOQ {B2B_MOQ}
                </span>
                <h2 className="font-display text-3xl md:text-5xl leading-none mt-3">
                  {product.name.toUpperCase()}
                </h2>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">
                  Code: {productCode(product)}
                </div>
                <p className="mt-3 text-muted-foreground text-sm">
                  {product.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-px bg-border">
                  <div className="bg-background p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Material
                    </div>
                    <div className="font-medium mt-1 text-sm">
                      {product.material}
                    </div>
                  </div>
                  <div className="bg-background p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Unit Price
                    </div>
                    <div className="font-display text-xl mt-1">
                      {product.price}
                      <span className="text-xs text-muted-foreground">/pc</span>
                    </div>
                  </div>
                </div>

                {/* Color selection removed from B2B per spec */}

                {/* Print type removed from B2B per spec */}

                <div className="mt-5">
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-2">
                    Sizes & Quantity (step of {B2B_STEP})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZES.map((s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between border border-border px-3 py-2"
                      >
                        <span className="font-condensed text-lg w-10">{s}</span>
                        <div className="inline-flex items-center border border-ink">
                          <button
                            onClick={() => bumpSize(s, -1)}
                            className="px-2.5 py-1.5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            step={B2B_STEP}
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

                {/* <div className="mt-5 border border-border bg-secondary">
                  <Row label="Unit Price" value={`₹${unitPrice}`} />
                  <Row label="Quantity" value={`${total} pcs`} />
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
                    label={`B2B Discount ${BULK_DISCOUNT_PCT}%`}
                    value={`−₹${discountAmt.toLocaleString("en-IN")}`}
                  />
                  <Row label="Courier" value="FREE" />
                  <Row
                    label="GST 5%"
                    value={`₹${gst.toLocaleString("en-IN")}`}
                  />
                  <div className="shine-sweep flex justify-between px-4 py-3 bg-ink text-cream">
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Total
                    </span>
                    <span className="font-display text-2xl">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div> */}

                                <div className="mt-5 border border-border bg-secondary">
                  <Row
                    label="Product Price"
                    value={
                      appliedCoupon && couponOffPerUnit > 0
                        ? `₹${baseUnitPrice} → ₹${unitPrice} / pc`
                        : `₹${baseUnitPrice} / pc`
                    }
                  />

                  {/* Coupon box inside price section */}
                  {/* <div className="px-4 py-3 border-t border-border space-y-2">
                    {!showCoupon ? (
                      <button
                        type="button"
                        onClick={() => setShowCoupon(true)}
                        className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 hover:border-ink transition"
                      >
                        Apply Coupon Code
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="border border-border px-3 py-1.5 text-sm w-40 focus:outline-none focus:border-ink bg-background"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="btn-bold text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          {couponLoading ? "Checking…" : "Apply"}
                        </button>
                        {appliedCoupon && (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setCouponCode("");
                              setCouponError("");
                            }}
                            className="text-xs text-destructive underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-destructive">{couponError}</p>
                    )}
                    {appliedCoupon && couponOffPerUnit > 0 && (
                      <p className="text-xs text-green-600">
                        Coupon <strong>{appliedCoupon.code}</strong>: −₹
                        {couponOffPerUnit}/pc → ₹{unitPrice} × {total} = ₹
                        {productLineTotal.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div> */}

                  {/* Premium Coupon Section */}
<div className="border-t border-border">
  {!showCoupon ? (
    <button
      type="button"
      onClick={() => setShowCoupon(true)}
      className="group w-full px-4 py-4 text-left transition-all hover:bg-background"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Coupon Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink bg-ink text-cream">
            <span className="text-lg">%</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">
                Have a Coupon?
              </span>

              <span className="rounded-full bg-ink px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cream">
                Offer
              </span>
            </div>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Apply your B2B promotional code and save more
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 transition group-hover:text-primary">
          Apply
        </span>
      </div>
    </button>
  ) : (
    <div className="px-4 py-4">
      {/* Coupon Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream">
            <span className="text-sm font-bold">%</span>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest">
              Apply Coupon
            </div>

            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Unlock your B2B offer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCoupon(false);
            setCouponError("");
          }}
          className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-destructive transition"
        >
          Close
        </button>
      </div>

      {/* Coupon Input */}
      {!appliedCoupon ? (
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(e.target.value.toUpperCase())
                }
                placeholder="ENTER COUPON CODE"
                className="h-11 w-full border border-border bg-background px-3 pr-3 text-xs font-semibold tracking-wider outline-none transition placeholder:text-muted-foreground/60 focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="h-11 shrink-0 bg-ink px-5 text-[10px] font-bold uppercase tracking-widest text-cream transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {couponLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking
                </span>
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {/* Small helper text */}
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Enter a valid promotional code to receive your discount.
          </div>
        </div>
      ) : (
        /* Applied Coupon */
        <div className="border border-ink bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Coupon Applied
                </div>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-wider">
                    {appliedCoupon.code}
                  </span>

                  <span className="text-[9px] font-semibold uppercase tracking-wider text-green-600">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAppliedCoupon(null);
                setCouponCode("");
                setCouponError("");
              }}
              className="text-[9px] font-semibold uppercase tracking-widest text-destructive underline underline-offset-2"
            >
              Remove
            </button>
          </div>

          {/* Discount Message */}
          <div className="mt-3 border-t border-border pt-2">
            <p className="text-[10px] text-muted-foreground">
              {appliedCoupon.discountType === "fixed"
                ? `₹${appliedCoupon.discountValue} discount applied per piece`
                : `${appliedCoupon.discountValue}% discount applied to product price`}
            </p>
          </div>
        </div>
      )}

      {/* Coupon Error */}
      {couponError && (
        <div className="mt-2 border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-[10px] font-medium text-destructive">
            {couponError}
          </p>
        </div>
      )}

      {/* Existing Applied Coupon Calculation */}
      {appliedCoupon && couponOffPerUnit > 0 && (
        <div className="mt-3 flex items-center justify-between border border-border bg-secondary px-3 py-2">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Your Price
          </span>

          <span className="text-xs font-bold">
            ₹{unitPrice} × {total} = ₹
            {productLineTotal.toLocaleString("en-IN")}
          </span>
        </div>
      )}
    </div>
  )}
</div>

                  <Row label="Quantity" value={`${total} pcs`} />
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
                  {b2bDiscountAmt > 0 && (
                    <Row
                      label={`B2B Discount ${BULK_DISCOUNT_PCT}%`}
                      value={`−₹${b2bDiscountAmt.toLocaleString("en-IN")}`}
                    />
                  )}
                  <Row label="Courier" value="FREE" />
                  <Row
                    label="GST 5%"
                    value={`₹${gst.toLocaleString("en-IN")}`}
                  />
                  <div className="shine-sweep flex justify-between px-4 py-3 bg-ink text-cream">
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Total
                    </span>
                    <span className="font-display text-2xl">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="mt-4 border-2 border-primary/40 bg-primary/5 p-4">
                  <div className="text-[11px] uppercase tracking-widest font-bold text-primary mb-2">
                    Delivery Information
                  </div>
                  <ul className="text-xs space-y-1 text-ink/80">
                    <li>
                      • <strong>Odisha (City to City):</strong> Transport
                      charges are extra and depend on destination.
                    </li>
                    <li>
                      • <strong>Other States:</strong> Additional courier or
                      transport charges will apply.
                    </li>
                  </ul>
                </div>

                {total > 0 && total < B2B_MOQ && (
                  <p className="text-xs text-destructive mt-2">
                    Minimum {B2B_MOQ} pcs required for B2B orders.
                  </p>
                )}

                <button
                  onClick={handlePay}
                  disabled={total < B2B_MOQ || isPaying}
                  className={`btn-bold btn-magnetic mt-5 w-full justify-center !py-3.5 ${total < B2B_MOQ || isPaying ? "opacity-40 cursor-not-allowed" : ""}`}
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
                <button
                  onClick={() => setSampleOpen(true)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-ink py-3 text-xs uppercase tracking-widest font-semibold hover:bg-ink hover:text-cream transition"
                >
                  <Package className="h-4 w-4" /> Order Sample Product
                </button>
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  Payment first. WhatsApp will open automatically with your
                  order summary — attach artwork there.
                </p>
              </div>
            </div>
            <ProductReviews productId={product.id} />

            {products.filter((p) => p.id !== product.id).length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-4xl md:text-5xl mb-8">
                  RELATED PRODUCTS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products
                    .filter((p) => p.id !== product.id)
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openProduct(p.id)}
                        className="text-left border border-border bg-card overflow-hidden hover:border-ink transition group"
                      >
                        <div className="aspect-square overflow-hidden bg-secondary">
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="p-3">
                          <div className="font-condensed text-sm tracking-wide leading-tight line-clamp-2">
                            {p.name.toUpperCase()}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {productCode(p)}
                          </div>
                          <div className="font-display text-lg mt-1">
                            {p.price}
                            <span className="text-[10px] text-muted-foreground">
                              /pc
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            )}
            {product && (
              <SampleDialog
                product={product}
                open={sampleOpen}
                onClose={() => setSampleOpen(false)}
                isGarment={true}
              />
            )}
          </>
        )}
      </section>
      {/* ================================ */}
      {/* PAYMENT SUCCESS MODAL */}
      {/* ================================ */}

      <Dialog
        open={!!successOrder}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessOrder(null);
          }
        }}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
          <div className="flex flex-col items-center px-6 py-8 text-center">
            {/* Success Icon */}
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold">Payment Successful!</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Your B2B order has been placed successfully.
            </p>

            {/* Order Details */}
            {successOrder && (
              <div className="mt-6 w-full rounded-xl bg-secondary p-4 text-left">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm text-muted-foreground">
                    Order ID
                  </span>

                  <span className="font-semibold">
                    #{successOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Amount Paid
                  </span>

                  <span className="text-lg font-bold">
                    ₹{Number(successOrder.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {/* Information */}
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-secondary p-4 text-left">
              <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <p className="text-sm text-muted-foreground">
                Your order has been received successfully. Our team will contact
                you soon regarding your B2B order.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-7 flex w-full flex-col gap-3">
              <button
                className="btn-bold w-full justify-center !py-3"
                onClick={() => {
                  setSuccessOrder(null);
                  navigate("/");
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </button>

              <button
                className="w-full border border-border py-3 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition"
                onClick={() => {
                  setSuccessOrder(null);

                  // Optional: reset order selection
                  resetSelections();

                  // Go back to B2B subcategories
                  pushView({ step: "subs" });
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between px-4 py-2 border-b border-border last:border-b-0">
    <span className="text-xs uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

const GateField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-ink"
    />
  </div>
);

export default B2BShop;

// function setSuccessOrder(arg0: { id: string; amount: number }) {
//   throw new Error("Function not implemented.");
// }
