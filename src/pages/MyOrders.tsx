import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";
import {
  Package,
  Check,
  Circle,
  Download,
  CreditCard,
  Star,
  MessageSquare,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { apiOrderToStorefront, type StorefrontOrder } from "@/lib/orderMappers";
import { downloadInvoice } from "@/lib/invoice";
import { openRazorpay } from "@/lib/razorpay";
import { toast } from "@/hooks/use-toast";
import { useCreateReview, useCustomerOrders } from "@/hooks/api";
import { createPayment, patchOrder } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { createPortal } from "react-dom";

const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "In Production",
  "Shipped",
  "Delivered",
] as const;

const MyOrders = () => {
  const navigate = useNavigate();
  const user = getSession();
  const {
    data: apiOrders = [],
    isLoading,
    refetch,
  } = useCustomerOrders(user?.id);
  const createReviewMut = useCreateReview();
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => {
    try {
      return new Set(
        JSON.parse(
          localStorage.getItem("arr_reviewed_orders") || "[]",
        ) as string[],
      );
    } catch {
      return new Set();
    }
  });
  const [reviewFor, setReviewFor] = useState<StorefrontOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  useLockBodyScroll(!!reviewFor);
    const headerRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    if (!user) navigate("/auth?next=/my-orders");
  }, [user, navigate]);

  const orders = useMemo(
    () => (user ? apiOrders.map((o) => apiOrderToStorefront(o, user.id)) : []),
    [apiOrders, user],
  );

  const payRemaining = (o: StorefrontOrder) => {
    const due = o.total - o.paid;
    if (due <= 0 || payingOrderId) return;
    setPayingOrderId(o.id);

    openRazorpay({
      amountInr: due,
      name: "Arrheniux — Balance Payment",
      description: `Balance for order #${o.id.slice(0, 8).toUpperCase()}`,
      onSuccess: async () => {
        try {
          await createPayment({
            orderId: o.id,
            customer: user?.name ?? "",
            amount: due,
            status: "Paid",
          });
          await patchOrder(o.id, { paid: o.total, paymentStatus: "Paid" });
        toast({ title: "Balance paid", description: "Your invoice has been updated." });
        refetch();
        } catch {
          toast({
            title: "Payment failed",
            description: "Could not record payment.",
            variant: "destructive",
          });
        } finally {
          setPayingOrderId(null);
        }
      },
      onDismiss: () => setPayingOrderId(null),
    });
  };

  const handleDownloadInvoice = async (o: StorefrontOrder) => {
    if (downloadingInvoiceId) return;
    try {
      setDownloadingInvoiceId(o.id);
      await downloadInvoice(o);
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not generate invoice.",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const submitReview = async () => {
    if (!reviewFor || !user) return;
    if (reviewText.trim().length < 5) {
      toast({
        title: "Add a bit more detail",
        description: "Reviews need at least 5 characters.",
      });
      return;
    }
    try {
      await createReviewMut.mutateAsync({
        customer: user.name,
        product: reviewFor.productName,
        productId: reviewFor.productId,
        orderId: reviewFor.id,
        rating,
        comment: reviewText.trim(),
        status: "Approved",
        verified: true,
      });
      const next = new Set(reviewedIds).add(reviewFor.id);
      setReviewedIds(next);
      localStorage.setItem("arr_reviewed_orders", JSON.stringify([...next]));
      toast({
        title: "Thanks!",
        description: "Your review is live on the product page.",
      });
      setReviewFor(null);
      setReviewText("");
      setRating(5);
    } catch {
      toast({
        title: "Review failed",
        description: "Could not submit review.",
        variant: "destructive",
      });
    }
  };
  if (!user) return null;

  return (
    <Layout>
      <section className="container-x py-12">
        <div ref={headerRef} className="reveal reveal-up">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Your Account
        </span>
        <h1 className="font-display text-5xl md:text-6xl mt-2">MY ORDERS</h1>
        </div>
        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-10 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No orders yet.</p>
            <Link to="/" className="btn-bold mt-6 inline-flex">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((o) => {
              const expected = o.expectedDelivery
  ? new Date(o.expectedDelivery)
  : new Date(new Date(o.createdAt).getTime() + 10 * 86400000);
              const due = Math.max(0, o.total - o.paid);
              const paymentPaid = due === 0;
              const delivered = o.status === "Delivered";
              const deliveredDate = o.deliveredAt ? new Date(o.deliveredAt) : null;
              const reviewed = reviewedIds.has(o.id);
              return (
<div key={o.id} className="glow-hover border border-border bg-card p-5 transition hover:border-primary/40">                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Order Id: #{o.id.toUpperCase()}
                          </div>
                          <div className="font-condensed text-2xl tracking-wide mt-1">
                            {o.productName.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            {o.productCode && (
                              <span>
                                Code:{" "}
                                <span className="font-mono">
                                  {o.productCode}
                                </span>
                              </span>
                            )}
                            <span>Qty: {o.qty} pcs</span>
                            <span>
                              Ordered:{" "}
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                               {delivered && deliveredDate
    ? `Delivered: ${deliveredDate.toLocaleDateString()}`
    : `Expected: ${expected.toLocaleDateString()}`}
                            </span>
                            <span className="uppercase">{o.kind}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge tone={paymentPaid ? "success" : "warn"}>
                              Payment:{" "}
                              {paymentPaid ? "Paid" : "Pending Balance"}
                            </Badge>
                            <Badge tone={delivered ? "success" : "info"}>
                              Delivery: {o.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl">
                            ₹{o.total.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Paid ₹{o.paid.toLocaleString("en-IN")}
                          </div>
                          {due > 0 && (
                            <div className="text-[10px] uppercase tracking-widest text-destructive font-semibold mt-0.5">
                              Balance ₹{due.toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-5 grid grid-cols-5 gap-1"> */}
                    <div
                    className="mt-5 grid grid-cols-5 gap-1 timeline-progress-line"
                    style={{
                      "--progress": `${(ORDER_STATUSES.indexOf(o.status) / (ORDER_STATUSES.length - 1)) * 100}%`,
                    } as React.CSSProperties}
                  >
                    {ORDER_STATUSES.map((s, i) => {
                      const currentIdx = ORDER_STATUSES.indexOf(o.status);
                      const reached = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div
                          key={s}
                          className="relative z-10 flex flex-col items-center text-center gap-1.5"
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                              reached
                                ? "bg-primary border-primary text-cream"
                                : "border-border text-muted-foreground bg-background"
                            } ${isCurrent ? "timeline-dot-active" : ""}`}
                          >
                            {reached ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] uppercase tracking-widest ${reached ? "text-ink font-semibold" : "text-muted-foreground"}`}
                          >
                            {s}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownloadInvoice(o)}
                        disabled={downloadingInvoiceId === o.id}
                        className="btn-magnetic text-[11px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-ink inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {downloadingInvoiceId === o.id ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                        ) : (
                          <><Download className="h-3.5 w-3.5" /> Download Invoice</>
                        )}
                      </button>
                      {!paymentPaid && (
                        <button
                          onClick={() => payRemaining(o)}
                          disabled={payingOrderId === o.id}
                          className="btn-magnetic text-[11px] uppercase tracking-widest bg-primary text-cream px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {payingOrderId === o.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                              Processing…
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3.5 w-3.5" /> Pay
                              Remaining ₹{due.toLocaleString("en-IN")}
                            </>
                          )}
                        </button>
                      )}
                      {delivered && !reviewed && (
                        <button
                          onClick={() => {
                            setReviewFor(o);
                            setRating(5);
                            setReviewText("");
                          }}
                          className="text-[11px] uppercase tracking-widest bg-ink text-cream px-3 py-1.5 inline-flex items-center gap-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Write Review
                        </button>
                      )}
                      {delivered && reviewed && (
                        <span className="text-[11px] uppercase tracking-widest text-primary inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Review Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {reviewFor && createPortal(
           <div
    className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
    onClick={() => setReviewFor(null)}
  >
    <div
      className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl my-6"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="font-condensed text-2xl tracking-wide">
        REVIEW: {reviewFor.productName.toUpperCase()}
      </h3>
               <div className="flex items-center gap-1 mt-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star className={`h-7 w-7 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
               <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={4}
        placeholder="Share your experience…"
        className="w-full mt-3 border border-border p-3 text-sm bg-background focus:outline-none focus:border-ink"
      />
      <div className="mt-4 flex gap-2 justify-end">
        <button onClick={() => setReviewFor(null)} className="text-xs uppercase tracking-widest px-3 py-2 border border-border">
          Cancel
        </button>
        <button
          onClick={submitReview}
          disabled={createReviewMut.isPending}
          className="btn-bold !py-2 text-xs disabled:opacity-50"
        >
          {createReviewMut.isPending ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…</>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
      </section>
    </Layout>
  );
};

const Badge = ({
  tone,
  children,
}: {
  tone: "success" | "warn" | "info";
  children: React.ReactNode;
}) => {
  const cls =
    tone === "success"
      ? "bg-primary/10 text-primary border-primary/20"
      : tone === "warn"
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-secondary text-ink border-border";
  return (
    <span
      className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${cls}`}
    >
      {children}
    </span>
  );
};

export default MyOrders;
