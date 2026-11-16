

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSalesAgent } from "../hooks/useSalesAgent";

export default function SalesAgentLogin() {
  const { login, isAuthenticated, loading: sessionLoading } = useSalesAgent();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect only in an effect — never during render
  useEffect(() => {
    if (!sessionLoading && isAuthenticated) {
      navigate("/agent-panel", { replace: true });
    }
  }, [sessionLoading, isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter your Agent Code");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await login(trimmed);
      navigate("/agent-panel", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Check your Agent Code.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  // While redirecting after auth, show a light placeholder
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-background px-4 dark:from-emerald-950/30">
  //     <div className="w-full max-w-md">
  //              <div className="mb-6 text-center">
  //         <img
  //           src="/arrhenius-logo.avif"
  //           alt="Arrheniux"
  //           className="mx-auto h-20 w-auto object-contain"
  //         />
  //         <div className="font-display text-lg md:text-xl tracking-wider text-ink">ARRHENIUX</div>
  //         <h1 className="mt-1 text-xl font-semibold">Sales Agent Login</h1>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           Sign in with your private Agent Code
  //         </p>
  //       </div>

  //       <form
  //         onSubmit={onSubmit}
  //         className="rounded-2xl border bg-background p-6 shadow-sm"
  //         autoComplete="off"
  //       >
  //         <label htmlFor="agent-code" className="text-xs font-medium text-muted-foreground">
  //           Agent Code
  //         </label>
  //         <input
  //           id="agent-code"
  //           name="agent-code"
  //           className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 font-mono text-sm outline-none ring-offset-background focus:ring-2 focus:ring-emerald-600"
  //           placeholder="ARX-SA…"
  //           value={code}
  //           onChange={(e) => {
  //             setCode(e.target.value);
  //             if (error) setError("");
  //           }}
  //           disabled={submitting}
  //           autoFocus
  //           spellCheck={false}
  //         />

  //         {error ? (
  //           <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
  //             {error}
  //           </p>
  //         ) : (
  //           <p className="mt-3 text-xs text-muted-foreground">
  //             This is not the public Share Store link. Use the private code only.
  //           </p>
  //         )}

  //         <button
  //           type="submit"
  //           disabled={submitting || !code.trim()}
  //           className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
  //         >
  //           {submitting ? "Signing in…" : "Sign in"}
  //         </button>
  //       </form>

  //       {/* <p className="mt-4 text-center text-xs text-muted-foreground">
  //         Customer storefront?{" "}
  //         <Link to="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
  //           Go to Arrheniux
  //         </Link>
  //       </p> */}
  //     </div>
  //   </div>
  // );


return (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#ecfdf5] via-white to-[#e0f2fe] px-4 py-10 dark:from-[#020617] dark:via-[#071c1b] dark:to-[#082f49]">

    {/* Background decoration */}
    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
    <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/10 blur-3xl" />

    <div className="relative z-10 w-full max-w-md">

      {/* Brand Header */}
      <div className="mb-7 text-center">
        
<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white bg-white p-2 shadow-xl shadow-emerald-900/15 ring-4 ring-white/50 dark:border-white/90 dark:bg-white dark:shadow-black/30 dark:ring-white/10">
  <img
    src="/arrhenius-logo.avif"
    alt="Arrheniux"
    className="h-full w-full object-contain"
  />
</div>


        <div className="font-display text-xl font-extrabold tracking-[0.2em] text-[#064e3b] dark:text-emerald-300">
          ARRHENIUX
        </div>

        <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          Sales Partner Portal
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Welcome Back
        </h1>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
          Sign in to manage your products, prices, earnings and personal store.
        </p>
      </div>

      {/* Login Card */}
      <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-black/30">

        {/* Card Header */}
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#075985] px-6 py-5 text-white">
          <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 -z-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">
              Secure access
            </p>
            <h2 className="mt-1 text-xl font-bold">
              Sales Agent Login
            </h2>
            <p className="mt-1 text-xs text-emerald-50/80">
              Enter your private Agent Code to continue.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-5 p-5 sm:p-7"
          autoComplete="off"
        >
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="agent-code"
                className="text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Agent Code
              </label>

              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRIVATE
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg
                  className="h-5 w-5 text-emerald-700 dark:text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
              </div>

              <input
                id="agent-code"
                name="agent-code"
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 py-3.5 pl-11 pr-4 font-mono text-sm font-semibold tracking-wide text-slate-900 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-emerald-700 dark:focus:border-emerald-500 dark:focus:bg-slate-900"
                placeholder="ARX-SA…"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError("");
                }}
                disabled={submitting}
                autoFocus
                spellCheck={false}
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium leading-5 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <span className="mt-0.5 font-bold">!</span>
                <span>{error}</span>
              </div>
            ) : (
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
                This is your private login code, not your public Share Store link.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#047857] via-emerald-600 to-[#0891b2] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

            <span className="relative">
              {submitting ? "Signing in…" : "Sign in to Dashboard"}
            </span>

            {!submitting ? (
              <svg
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            ) : (
              <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
            <svg
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your account access is private and secure.
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} ARRHENIUX
        <span className="mx-2 text-emerald-600 dark:text-emerald-400">•</span>
        Sales Partner Portal
      </p>
    </div>
  </div>
);

}