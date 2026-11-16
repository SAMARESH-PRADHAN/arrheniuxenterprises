// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSalesAgent } from "../hooks/useSalesAgent";

// export default function SalesAgentLogin() {
//   const { login, isAuthenticated } = useSalesAgent();
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   if (isAuthenticated) {
//     navigate("/agent-panel", { replace: true });
//   }

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await login(code);
//       navigate("/agent-panel", { replace: true });
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
//       <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-sm">
//         <h1 className="text-xl font-semibold">Sales Agent Login</h1>
//         <p className="mt-1 text-sm text-muted-foreground">Enter your private Agent Code</p>
//         <input
//           className="mt-4 w-full rounded-md border px-3 py-2 text-sm font-mono"
//           placeholder="ARX-SA…"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           autoComplete="off"
//         />
//         {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
//         <button
//           type="submit"
//           disabled={loading || !code.trim()}
//           className="mt-4 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
//         >
//           {loading ? "Signing in…" : "Sign in"}
//         </button>
//       </form>
//     </div>
//   );
// }

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-background px-4 dark:from-emerald-950/30">
      <div className="w-full max-w-md">
               <div className="mb-6 text-center">
          <img
            src="/arrhenius-logo.avif"
            alt="Arrheniux"
            className="mx-auto h-20 w-auto object-contain"
          />
          <div className="font-display text-lg md:text-xl tracking-wider text-ink">ARRHENIUX</div>
          <h1 className="mt-1 text-xl font-semibold">Sales Agent Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your private Agent Code
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border bg-background p-6 shadow-sm"
          autoComplete="off"
        >
          <label htmlFor="agent-code" className="text-xs font-medium text-muted-foreground">
            Agent Code
          </label>
          <input
            id="agent-code"
            name="agent-code"
            className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 font-mono text-sm outline-none ring-offset-background focus:ring-2 focus:ring-emerald-600"
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

          {error ? (
            <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              This is not the public Share Store link. Use the private code only.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* <p className="mt-4 text-center text-xs text-muted-foreground">
          Customer storefront?{" "}
          <Link to="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Go to Arrheniux
          </Link>
        </p> */}
      </div>
    </div>
  );
}