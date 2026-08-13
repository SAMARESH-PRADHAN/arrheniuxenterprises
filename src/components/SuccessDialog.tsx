import { createPortal } from "react-dom";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId?: string;
  amount?: number;
  title?: string;
  description?: string;
};

export const SuccessDialog = ({
  open,
  onClose,
  orderId,
  amount,
  title = "Payment Successful!",
  description = "Your order has been placed. WhatsApp is opening with your order details — please share your artwork or notes there.",
}: Props) => {
    useLockBodyScroll(open);   // ← add this line

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-cream w-full max-w-md border border-border shadow-2xl animate-scale-in relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shimmer" />
        <div className="p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-success-pop">
            <CheckCircle2 className="h-12 w-12 text-primary animate-success-tick" strokeWidth={2.5} />
          </div>
          <h3 className="font-display text-3xl mt-5 tracking-tight">{title}</h3>
          {orderId && (
            <div className="mt-2 inline-block text-[11px] font-mono bg-secondary border border-border px-2 py-1">
              Order #{orderId.slice(0, 8).toUpperCase()}
            </div>
          )}
          {typeof amount === "number" && (
            <div className="mt-3 text-2xl font-display text-primary">₹{amount.toLocaleString("en-IN")}</div>
          )}
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{description}</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link to="/my-orders" onClick={onClose} className="btn-bold justify-center !py-3 text-xs">
              <Package className="h-4 w-4" /> View Orders
            </Link>
            <button onClick={onClose} className="btn-outline-bold justify-center !py-3 text-xs">
              <ShoppingBag className="h-4 w-4" /> Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
        document.body

  );
};
