// Demo Razorpay integration — replace VITE_RAZORPAY_KEY_ID with a real
// rzp_test_... / rzp_live_... key when ready. Falls back to a simulated
// confirm dialog when the demo placeholder is used or the SDK fails to load.

// declare global {
//   interface Window {
//     Razorpay?: new (opts: unknown) => { open: () => void };
//   }
// }

// const KEY: string =
//   (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) ||
//   "rzp_test_DEMO";

// const loadSdk = (): Promise<boolean> =>
//   new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const s = document.createElement("script");
//     s.src = "https://checkout.razorpay.com/v1/checkout.js";
//     s.onload = () => resolve(true);
//     s.onerror = () => resolve(false);
//     document.body.appendChild(s);
//   });

// export type RzpOptions = {
//   amountInr: number;   // rupees
//   name: string;
//   description: string;
//   prefill?: { name?: string; email?: string; contact?: string };
//   onSuccess: (paymentId: string) => void;
//   onDismiss?: () => void;
// };

// export const openRazorpay = async (opts: RzpOptions) => {
//   const amountPaise = Math.max(1, Math.round(opts.amountInr * 100));

//   // Demo mode: no real key → simulate
//   if (KEY === "rzp_test_DEMO") {
//     const ok = window.confirm(
//       `Demo payment — Razorpay test key not configured yet.\n\nSimulate a successful payment of ₹${opts.amountInr.toLocaleString(
//         "en-IN"
//       )} for "${opts.description}"?`
//     );
//     if (ok) opts.onSuccess(`demo_${Date.now()}`);
//     else opts.onDismiss?.();
//     return;
//   }

//   const ready = await loadSdk();
//   if (!ready || !window.Razorpay) {
//     alert("Payment gateway failed to load. Please try again.");
//     opts.onDismiss?.();
//     return;
//   }

//   const rzp = new window.Razorpay({
//     key: KEY,
//     amount: amountPaise,
//     currency: "INR",
//     name: opts.name,
//     description: opts.description,
//     prefill: opts.prefill,
//     theme: { color: "#1a1a1a" },
//     handler: (resp: { razorpay_payment_id: string }) =>
//       opts.onSuccess(resp.razorpay_payment_id),
//     modal: { ondismiss: () => opts.onDismiss?.() },
//   });
//   rzp.open();
// };



// src/lib/razorpay.ts
declare global {
  interface Window {
    Razorpay?: new (opts: unknown) => { open: () => void };
  }
}

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000/api";

const loadSdk = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export type RzpOptions = {
  amountInr: number;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
};

export const openRazorpay = async (opts: RzpOptions) => {
  // 1. Create order on backend
  const orderRes = await fetch(`${API_BASE}/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: opts.amountInr, receipt: `order_${Date.now()}` }),
  });

  if (!orderRes.ok) {
    alert("Could not start payment. Please try again.");
    opts.onDismiss?.();
    return;
  }
  const order = await orderRes.json();

  // 2. Load checkout script
  const ready = await loadSdk();
  if (!ready || !window.Razorpay) {
    alert("Payment gateway failed to load. Please try again.");
    opts.onDismiss?.();
    return;
  }

  // 3. Open checkout — restricted to UPI + Card only
  const rzp = new window.Razorpay({
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: opts.name,
    description: opts.description,
    prefill: opts.prefill,
    theme: { color: "#1a1a1a" },
    // Restrict to only UPI & Card
    method: {
      netbanking: false,
      wallet: false,
      emi: false,
      paylater: false,
      upi: true,
      card: true,
    },
    handler: async (resp: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      // 4. Verify signature on backend before trusting the payment
      const verifyRes = await fetch(`${API_BASE}/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resp),
      });
      if (!verifyRes.ok) {
        alert("Payment could not be verified. Contact support with your payment ID: " + resp.razorpay_payment_id);
        return;
      }
      opts.onSuccess(resp.razorpay_payment_id);
    },
    modal: { ondismiss: () => opts.onDismiss?.() },
  });
  rzp.open();
};