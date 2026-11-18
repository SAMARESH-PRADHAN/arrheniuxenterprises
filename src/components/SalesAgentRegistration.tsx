// import { useState } from "react";
// import { createPortal } from "react-dom";
// import {
//   UserPlus,
//   X,
//   Info,
//   Send,
//   BadgePercent,
//   Share2,
//   Wallet,
//   Package,
//   ShieldCheck,
//   CheckCircle2,
//   Sparkles,
// } from "lucide-react";
// import { waLink } from "@/data/site";
// import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
// import { toast } from "@/hooks/use-toast"

// /* ================= EDIT THESE: rules & benefits text ================= */
// const BENEFITS = [
//   {
//     icon: Wallet,
//     title: "Earn 80% of your margin",
//     text: "Set your own selling price above MRP and keep 80% of the extra amount.",
//   },
//   {
//     icon: Share2,
//     title: "Your personal store link",
//     text: "Get a public store link to share on WhatsApp, Instagram and Facebook.",
//   },
//   {
//     icon: Package,
//     title: "Factory-direct products",
//     text: "Sell custom T-shirts, hoodies, uniforms and more, made in-house.",
//   },
//   {
//     icon: BadgePercent,
//     title: "Agent dashboard",
//     text: "Track orders, customers, earnings and payouts in one place.",
//   },
// ];

// const RULES = [
//   "Applicant must be 18 years or older.",
//   "Provide correct name, mobile number, address and email.",
//   "Your agent price can be set from MRP up to MRP + ₹100.",
//   "Your Agent Code is private. Never share it with customers.",
//   "Payments from customers go directly to Arrheniux.",
//   "Payouts are released by Arrheniux after order confirmation.",
//   "Arrheniux may approve or reject any application.",
// ];

// const QUALIFICATIONS = [
//   "10th Pass",
//   "12th Pass",
//   "Diploma",
//   "Graduate",
//   "Post Graduate",
//   "Other",
// ];
// /* ===================================================================== */

// type Form = {
//   name: string;
//   mobile: string;
//   address: string;
//   email: string;
//   dob: string;
//   qualification: string;
// };
// const EMPTY: Form = {
//   name: "",
//   mobile: "",
//   address: "",
//   email: "",
//   dob: "",
//   qualification: "",
// };

// const inputCls =
//   "mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

// export const SalesAgentRegistration = () => {
//   const [open, setOpen] = useState(false);
//   const [infoOpen, setInfoOpen] = useState(false);
//   const [form, setForm] = useState<Form>(EMPTY);
//   const [error, setError] = useState("");

//   useLockBodyScroll(open || infoOpen);

//   const set = (k: keyof Form) => (v: string) =>
//     setForm((f) => ({ ...f, [k]: v }));

 
// const submit = (e: React.FormEvent) => {
//   e.preventDefault();

//   const { name, mobile, address, email, dob, qualification } = form;

//   // Required field validation
//   if (
//     !name.trim() ||
//     !mobile.trim() ||
//     !address.trim() ||
//     !email.trim() ||
//     !dob ||
//     !qualification
//   ) {
//     return setError("Please fill all the fields.");
//   }

//   // Mobile validation
//   if (!/^\d{10}$/.test(mobile.trim())) {
//     return setError("Enter a valid 10-digit mobile number.");
//   }

//   // Email validation
//   if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
//     return setError("Enter a valid email address.");
//   }

//   setError("");

//   const msg = [
//     "*SALES AGENT REGISTRATION — Arrheniux*",
//     "",
//     `• Name: ${name.trim()}`,
//     `• Mobile: ${mobile.trim()}`,
//     `• Email: ${email.trim()}`,
//     `• Date of Birth: ${dob}`,
//     `• Qualification: ${qualification}`,
//     `• Address: ${address.trim()}`,
//     "",
//     "I am interested in joining as an Arrheniux Sales Agent.",
//   ].join("\n");

//   // Generate WhatsApp URL
//   const whatsappUrl = waLink(msg);

//   // Navigate directly to WhatsApp
//   window.location.assign(whatsappUrl);
// };


//   return (
//     <>
//       {/* ===== Floating side tab (right side) ===== */}
//       <button
//         onClick={() => setOpen(true)}
//         aria-label="Become a agent"
//         className="fixed right-0 top-1/2 z-40 -translate-y-1/2 flex flex-col items-center gap-2 rounded-l-2xl bg-gradient-to-b from-primary via-primary to-accent px-2.5 py-4 text-cream shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.6)] transition-all hover:pr-4 hover:shadow-xl"
//       >
//         <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
//           <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
//           <UserPlus className="relative h-4 w-4" />
//         </span>
//         <span
//           className="text-[11px] font-extrabold uppercase tracking-[0.2em]"
//           style={{ writingMode: "vertical-rl" }}
//         >
//           Register as an Agent
//         </span>
//       </button>

//       {/* ===== Registration modal ===== */}
//       {open &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-3 backdrop-blur-sm animate-fade-in"
//             onClick={() => setOpen(false)}
//           >
//             <div
//               className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden border border-border bg-cream shadow-2xl animate-scale-in"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Header */}
//               <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-5 py-5 text-cream">
//                 <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
//                 <div className="relative flex items-start justify-between gap-3">
//                   <div>
//                     <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
//                       <Sparkles className="h-3 w-3" /> Join Our Team
//                     </span>
//                     <h3 className="mt-2 font-display text-2xl leading-tight">
//                       SALES AGENT REGISTRATION
//                     </h3>
//                     <p className="mt-1 text-xs text-cream/80">
//                       Fill in your details — we'll connect on WhatsApp.
//                     </p>
//                   </div>
//                   <div className="flex shrink-0 gap-1.5">
//                     <button
//                       type="button"
//                       onClick={() => setInfoOpen(true)}
//                       className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition hover:bg-white/30"
//                     >
//                       <Info className="h-3.5 w-3.5" /> Info
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setOpen(false)}
//                       aria-label="Close"
//                       className="rounded-full bg-white/20 p-1.5 transition hover:bg-white/30"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Form */}
//               <form
//                 onSubmit={submit}
//                 className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
//               >
//                 <div className="grid gap-3 sm:grid-cols-2">
//                   <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                     Full Name *
//                     <input
//                       className={inputCls}
//                       value={form.name}
//                       onChange={(e) => set("name")(e.target.value)}
//                     />
//                   </label>
//                   <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                     Mobile Number *
//                     <input
//                       className={inputCls}
//                       inputMode="numeric"
//                       maxLength={10}
//                       value={form.mobile}
//                       onChange={(e) =>
//                         set("mobile")(e.target.value.replace(/\D/g, ""))
//                       }
//                     />
//                   </label>
//                   <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                     Email *
//                     <input
//                       type="email"
//                       className={inputCls}
//                       value={form.email}
//                       onChange={(e) => set("email")(e.target.value)}
//                     />
//                   </label>
//                   <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                     Date of Birth *
//                     <input
//                       type="date"
//                       className={inputCls}
//                       value={form.dob}
//                       max={new Date().toISOString().slice(0, 10)}
//                       onChange={(e) => set("dob")(e.target.value)}
//                     />
//                   </label>
//                 </div>

//                 <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                   Qualification *
//                   <select
//                     className={inputCls}
//                     value={form.qualification}
//                     onChange={(e) => set("qualification")(e.target.value)}
//                   >
//                     <option value="">Select qualification…</option>
//                     {QUALIFICATIONS.map((q) => (
//                       <option key={q} value={q}>
//                         {q}
//                       </option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
//                   Full Address *
//                   <textarea
//                     rows={3}
//                     className={inputCls}
//                     value={form.address}
//                     onChange={(e) => set("address")(e.target.value)}
//                   />
//                 </label>

//                 {error && (
//                   <p className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
//                     {error}
//                   </p>
//                 )}

//                 <button
//                   type="submit"
//                   className="btn-wa w-full justify-center !py-3.5"
//                 >
//                   <Send className="h-4 w-4" /> Send via WhatsApp
//                 </button>
//                 <p className="text-center text-[11px] text-muted-foreground">
//                   Your details are sent directly to Arrheniux on WhatsApp.
//                 </p>
//               </form>
//             </div>
//           </div>,
//           document.body,
//         )}

//       {/* ===== Info modal (rules & benefits) ===== */}
//       {open &&
//         infoOpen &&
//         createPortal(
//           <div
//             className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-sm animate-fade-in"
//             onClick={() => setInfoOpen(false)}
//           >
//             <div
//               className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden border border-border bg-cream shadow-2xl animate-scale-in"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex shrink-0 items-center justify-between bg-ink px-5 py-4 text-cream">
//                 <div className="flex items-center gap-2">
//                   <ShieldCheck className="h-5 w-5 text-accent" />
//                   <h3 className="font-condensed text-xl tracking-wide">
//                     RULES & BENEFITS
//                   </h3>
//                 </div>
//                 <button
//                   onClick={() => setInfoOpen(false)}
//                   aria-label="Close"
//                   className="rounded-full p-1.5 hover:bg-white/10"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>

//               <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
//                 <section>
//                   <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
//                     Benefits
//                   </h4>
//                   <div className="space-y-2.5">
//                     {BENEFITS.map((b) => (
//                       <div
//                         key={b.title}
//                         className="flex gap-3 border border-border bg-card p-3 transition hover:border-primary/40"
//                       >
//                         <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-cream">
//                           <b.icon className="h-4 w-4" />
//                         </span>
//                         <div>
//                           <div className="text-sm font-semibold">{b.title}</div>
//                           <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
//                             {b.text}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </section>

//                 <section>
//                   <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
//                     Registration Rules
//                   </h4>
//                   <ul className="space-y-2">
//                     {RULES.map((r) => (
//                       <li
//                         key={r}
//                         className="flex items-start gap-2 text-sm text-ink/80"
//                       >
//                         <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
//                         {r}
//                       </li>
//                     ))}
//                   </ul>
//                 </section>
//               </div>

//               <div className="shrink-0 border-t border-border px-5 py-3">
//                 <button
//                   onClick={() => setInfoOpen(false)}
//                   className="btn-bold w-full justify-center !py-3 text-xs"
//                 >
//                   Got it, continue to form
//                 </button>
//               </div>
//             </div>
//           </div>,
//           document.body,
//         )}
//     </>
//   );
// };

// export default SalesAgentRegistration;

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  UserPlus, X, Info, Send, BadgePercent, Share2, Wallet, Package,
  ShieldCheck, CheckCircle2, Sparkles, UserCheck, KeyRound, Tag, IndianRupee,
  ArrowRight, Lightbulb,
} from "lucide-react";
import { waLink } from "@/data/site";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { toast } from "@/hooks/use-toast";

/* ================= EDIT THESE: info modal content ================= */
const STEPS = [
  { icon: UserPlus, title: "Register", text: "Fill the form and send it on WhatsApp." },
  { icon: UserCheck, title: "Get approved", text: "Arrheniux reviews your details and contacts you." },
  { icon: KeyRound, title: "Receive your Agent Code", text: "Log in to your private agent panel." },
  { icon: Tag, title: "Set your price", text: "Choose your selling price from MRP up to MRP + ₹100." },
  { icon: Share2, title: "Share your store link", text: "Send it on WhatsApp, Instagram or Facebook." },
  { icon: Wallet, title: "Earn on every order", text: "Track orders and payouts in your dashboard." },
];

const BENEFITS = [
  { icon: Wallet, title: "80% of your margin", text: "Keep 80% of the extra amount above MRP." },
  { icon: Share2, title: "Personal store link", text: "Your own public link to share anywhere." },
  { icon: Package, title: "Factory-direct products", text: "T-shirts, hoodies, uniforms and more." },
  { icon: BadgePercent, title: "Agent dashboard", text: "Orders, customers, earnings in one place." },
];

const RULES = [
  "Applicant must be 18 years or older.",
  "Provide correct name, mobile number, address and email.",
  "Your agent price can be set from MRP up to MRP + ₹100.",
  "Your Agent Code is private. Never share it with customers.",
  "Payments from customers go directly to Arrheniux.",
  "Payouts are released by Arrheniux after order confirmation.",
  "Arrheniux may approve or reject any application.",
];

// Example shown in the "How much can I earn?" box
const EXAMPLE = { mrp: 300, agentPrice: 400 };

const QUALIFICATIONS = ["10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate", "Other"];
/* ================================================================== */

type Form = {
  name: string; mobile: string; address: string;
  email: string; dob: string; qualification: string;
};
const EMPTY: Form = { name: "", mobile: "", address: "", email: "", dob: "", qualification: "" };

const inputCls =
  "mt-1 w-full border border-border bg-background px-3 py-2.5 text-base sm:text-sm normal-case tracking-normal text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

// Red close button (used in both modals)
const closeBtnCls =
  "inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 hover:rotate-90 active:transform-none";

// Entrance animation delay helper
const delay = (i: number, base = 150) => ({ animationDelay: `${base + i * 70}ms` });

export const SalesAgentRegistration = () => {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState("");

  useLockBodyScroll(open || infoOpen);

  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, mobile, address, email, dob, qualification } = form;
    if (!name.trim() || !mobile.trim() || !address.trim() || !email.trim() || !dob || !qualification)
      return setError("Please fill all the fields.");
    if (!/^\d{10}$/.test(mobile.trim())) return setError("Enter a valid 10-digit mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    setError("");

    const msg = [
      "*SALES AGENT REGISTRATION — Arrheniux*",
      "",
      `• Name: ${name.trim()}`,
      `• Mobile: ${mobile.trim()}`,
      `• Email: ${email.trim()}`,
      `• Date of Birth: ${dob}`,
      `• Qualification: ${qualification}`,
      `• Address: ${address.trim()}`,
      "",
      "I am interested in joining as an Arrheniux Sales Agent.",
    ].join("\n");

    window.open(waLink(msg), "_blank", "noreferrer");
    toast({ title: "Opening WhatsApp", description: "Send the message to complete your registration." });
    setForm(EMPTY);
    setOpen(false);
  };

  const margin = EXAMPLE.agentPrice - EXAMPLE.mrp;
  const agentShare = Math.round(margin * 0.8);

  return (
    <>
      {/* ===== Animations (self-contained) ===== */}
      <style>{`
        @keyframes sar-backdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sar-pop {
          0%   { opacity: 0; transform: translateY(40px) scale(.9); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes sar-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes sar-sheen { from { transform: translateX(-130%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }
        @keyframes sar-bob { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
        .sar-backdrop { animation: sar-backdrop .2s ease-out both; }
        .sar-pop { animation: sar-pop .55s cubic-bezier(.2,.9,.3,1.2) both; }
        .sar-rise { animation: sar-rise .5s cubic-bezier(.2,.8,.2,1) both; }
        .sar-sheen::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
          animation: sar-sheen 2.6s ease-in-out infinite; pointer-events: none;
        }
        .sar-bob { animation: sar-bob 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sar-pop, .sar-rise, .sar-backdrop, .sar-bob, .sar-sheen::after { animation: none !important; }
        }
      `}</style>

      {/* ===== Floating side tab (flex-centered, NO transform => click always works) ===== */}
      <div className="pointer-events-none fixed inset-y-0 right-0 z-40 flex items-center">
        <button
          onClick={() => setOpen(true)}
          aria-label="Become a sales agent"
          className="sar-bob sar-sheen pointer-events-auto relative flex flex-col items-center gap-2 overflow-hidden rounded-l-2xl bg-gradient-to-b from-primary via-primary to-accent px-2 py-3 sm:px-2.5 sm:py-4 text-cream shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.6)] transition-shadow hover:shadow-[0_12px_40px_-6px_hsl(var(--primary)/0.8)] active:transform-none"
        >
          <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/20">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            <UserPlus className="relative h-4 w-4" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ writingMode: "vertical-rl" }}>
            Register as an Agent
          </span>
        </button>
      </div>

      {/* ===== Registration modal ===== */}
      {open &&
        createPortal(
          <div
            className="sar-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-3 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="sar-pop relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden border border-border bg-cream shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sar-sheen relative shrink-0 overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-4 py-4 sm:px-5 sm:py-5 text-cream">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                <div className="relative flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="sar-rise inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest" style={delay(0, 100)}>
                      <Sparkles className="h-3 w-3" /> Join Our Team
                    </span>
                    <h3 className="sar-rise mt-2 font-display text-xl sm:text-2xl leading-tight" style={delay(1, 100)}>
                      SALES AGENT REGISTRATION
                    </h3>
                    <p className="sar-rise mt-1 text-xs text-cream/80" style={delay(2, 100)}>
                      Fill in your details — we'll connect on WhatsApp.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInfoOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-md transition hover:bg-cream active:transform-none"
                    >
                      <Info className="h-3.5 w-3.5" /> Info
                    </button>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Close" className={closeBtnCls}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(0, 250)}>
                    Full Name *
                    <input className={inputCls} value={form.name} onChange={(e) => set("name")(e.target.value)} />
                  </label>
                  <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(1, 250)}>
                    Mobile Number *
                    <input
                      className={inputCls} inputMode="numeric" maxLength={10}
                      value={form.mobile}
                      onChange={(e) => set("mobile")(e.target.value.replace(/\D/g, ""))}
                    />
                  </label>
                  <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(2, 250)}>
                    Email *
                    <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email")(e.target.value)} />
                  </label>
                  <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(3, 250)}>
                    Date of Birth *
                    <input
                      type="date" className={inputCls} value={form.dob}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => set("dob")(e.target.value)}
                    />
                  </label>
                </div>

                <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(4, 250)}>
                  Qualification *
                  <select className={inputCls} value={form.qualification} onChange={(e) => set("qualification")(e.target.value)}>
                    <option value="">Select qualification…</option>
                    {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </label>

                <label className="sar-rise block text-[10px] font-medium uppercase tracking-widest text-muted-foreground" style={delay(5, 250)}>
                  Full Address *
                  <textarea rows={3} className={inputCls} value={form.address} onChange={(e) => set("address")(e.target.value)} />
                </label>

                {error && (
                  <p className="sar-rise border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                <div className="sar-rise" style={delay(6, 250)}>
                  <button type="submit" className="btn-wa sar-sheen relative w-full justify-center overflow-hidden !py-3.5">
                    <Send className="h-4 w-4" /> Send via WhatsApp
                  </button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Your details are sent directly to Arrheniux on WhatsApp.
                  </p>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* ===== Info modal: beginner-friendly guide ===== */}
      {open && infoOpen &&
        createPortal(
          <div
            className="sar-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-3 backdrop-blur-sm"
            onClick={() => setInfoOpen(false)}
          >
            <div
              className="sar-pop relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden border border-border bg-cream shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero */}
              <div className="sar-sheen relative shrink-0 overflow-hidden bg-gradient-to-br from-ink via-[hsl(145_45%_18%)] to-primary px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5 text-cream">
                <div className="pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full bg-accent/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 right-0 h-40 w-40 rounded-full bg-primary/40 blur-3xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-cream">
                      <Lightbulb className="h-3 w-3" /> New here? Start here
                    </span>
                    <h3 className="mt-3 font-display text-2xl sm:text-3xl leading-[0.95]">
                      BECOME AN <span className="text-accent">ARRHENIUX</span> AGENT
                    </h3>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-cream/75">
                      Everything a beginner needs to know: how it works, what you earn and the rules.
                    </p>
                  </div>
                  <button onClick={() => setInfoOpen(false)} aria-label="Close" className={closeBtnCls}>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick stats */}
                <div className="relative mt-5 grid grid-cols-3 gap-2">
                  {[
                    { v: "80%", l: "Your margin share" },
                    { v: "+₹100", l: "Max above MRP" },
                    { v: "24/7", l: "Your own store" },
                  ].map((s, i) => (
                    <div key={s.l} className="sar-rise rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 text-center backdrop-blur" style={delay(i, 200)}>
                      <div className="font-display text-lg sm:text-xl text-accent">{s.v}</div>
                      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-cream/70">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
                {/* How it works */}
                <section>
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
                    <span className="h-1 w-6 rounded-full bg-accent" /> How it works
                  </h4>
                  <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-accent">
                    {STEPS.map((s, i) => (
                      <li key={s.title} className="sar-rise relative flex gap-3" style={delay(i, 300)}>
                        <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-cream shadow-md ring-4 ring-cream">
                          <s.icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1 border border-border bg-card px-3 py-2.5 transition hover:border-primary/40 hover:shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-accent">STEP {i + 1}</span>
                            <span className="text-sm font-bold">{s.title}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Earnings example */}
                <section className="sar-rise overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" style={delay(7, 300)}>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-cream">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest">How much can I earn? (Example)</span>
                  </div>
                  <div className="space-y-1.5 p-4 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Normal price (MRP)</span><b>₹{EXAMPLE.mrp}</b></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Your selling price</span><b>₹{EXAMPLE.agentPrice}</b></div>
                    <div className="flex justify-between border-t border-dashed border-primary/30 pt-1.5"><span className="text-muted-foreground">Extra margin</span><b>₹{margin}</b></div>
                    <div className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-cream">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><ArrowRight className="h-3.5 w-3.5" /> You earn per piece (80%)</span>
                      <span className="font-display text-xl">₹{agentShare}</span>
                    </div>
                  </div>
                </section>

                {/* Benefits */}
                <section>
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
                    <span className="h-1 w-6 rounded-full bg-accent" /> Benefits
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {BENEFITS.map((b, i) => (
                      <div key={b.title} className="sar-rise group border border-border bg-card p-3.5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md" style={delay(i, 350)}>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-cream transition group-hover:scale-110">
                          <b.icon className="h-4 w-4" />
                        </span>
                        <div className="mt-2.5 text-sm font-bold">{b.title}</div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{b.text}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Rules */}
                <section>
                  <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
                    <span className="h-1 w-6 rounded-full bg-accent" /> <ShieldCheck className="h-4 w-4" /> Rules to follow
                  </h4>
                  <ul className="space-y-2 border-l-4 border-accent bg-secondary/60 p-4">
                    {RULES.map((r, i) => (
                      <li key={r} className="sar-rise flex items-start gap-2 text-sm text-ink/85" style={delay(i, 400)}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="shrink-0 border-t border-border bg-cream px-4 py-3 sm:px-5">
                <button onClick={() => setInfoOpen(false)} className="btn-bold sar-sheen relative w-full justify-center overflow-hidden !py-3 text-xs">
                  Got it — take me to the form <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default SalesAgentRegistration;