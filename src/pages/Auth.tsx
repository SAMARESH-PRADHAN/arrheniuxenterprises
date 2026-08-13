import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
// import { socialLogin } from "@/lib/authStore";
import { useLogin, useSignup, useGoogleLogin } from "@/hooks/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

const Auth = () => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const next = params.get("next");
  const [error, setError] = useState("");
  const signupMut = useSignup();
  const loginMut = useLogin();
  const googleLoginMut = useGoogleLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [s, setS] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
  });

  const afterAuth = (role: "admin" | "customer") => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    navigate(next || "/", {
      replace: true,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const r = await loginMut.mutateAsync({ email, password });
      if (r.ok && r.user) afterAuth(r.user.role);
      else setError(r.error || "Login failed");
    } catch {
      setError("Login failed. Check your connection.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!s.name || !s.email || !s.password) {
      setError("Name, email and password required");
      return;
    }
    try {
      const r = await signupMut.mutateAsync({
        name: s.name,
        email: s.email,
        phone: s.phone,
        password: s.password, // ← add this line
      });
      if (r.ok && r.user) {
        afterAuth(r.user.role);
      } else setError(r.error || "Signup failed");
    } catch {
      setError("Signup failed. Check your connection.");
    }
  };

  const handleGoogleCredential = async (response: { credential: string }) => {
    setError("");

    try {
      const r = await googleLoginMut.mutateAsync(response.credential);

      if (r.ok && r.user) {
        afterAuth(r.user.role);
      } else {
        setError(r.error || "Google login failed");
      }
    } catch {
      setError("Google login failed. Please try again.");
    }
  };
  useEffect(() => {
  if (!GOOGLE_CLIENT_ID) {
    console.error(
      "VITE_GOOGLE_CLIENT_ID is not configured in the frontend .env file."
    );
    return;
  }

  const initializeGoogle = () => {
    if (!window.google) {
      return false;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    const button = document.getElementById("google-signin-button");

    if (button) {
      button.innerHTML = "";

      window.google.accounts.id.renderButton(button, {
        theme: "outline",
        size: "large",
        width: 350,
        text: "continue_with",
        shape: "rectangular",
      });
    }

    return true;
  };

  if (initializeGoogle()) {
    return;
  }

  const interval = window.setInterval(() => {
    if (initializeGoogle()) {
      window.clearInterval(interval);
    }
  }, 100);

  return () => {
    window.clearInterval(interval);
  };
}, []);

  const pending =
    signupMut.isPending || loginMut.isPending || googleLoginMut.isPending;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ambient opacity-60"
      />
      <div className="auth-card-enter relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border p-8">
        <div className="flex justify-center mb-6 logo-glow">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${tab === "login" ? "bg-white shadow text-ink auth-tab-active" : "text-muted-foreground"}`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${tab === "signup" ? "bg-white shadow text-ink auth-tab-active" : "text-muted-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={pending}
              className="btn-magnetic w-full bg-ink hover:bg-ink/90 text-cream font-medium py-2.5 rounded-md transition disabled:opacity-60"
            >
              {pending ? "Logging in…" : "Log In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <Field
              label="Full Name"
              value={s.name}
              onChange={(v) => setS({ ...s, name: v })}
            />
            <Field
              label="Email"
              type="email"
              value={s.email}
              onChange={(v) => setS({ ...s, email: v })}
            />
            <Field
              label="Phone"
              value={s.phone}
              onChange={(v) => setS({ ...s, phone: v })}
            />
            <Field
              label="Company (optional)"
              value={s.company}
              onChange={(v) => setS({ ...s, company: v })}
            />
            <Field
              label="Password"
              type="password"
              value={s.password}
              onChange={(v) => setS({ ...s, password: v })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={pending}
              className="btn-magnetic w-full bg-ink hover:bg-ink/90 text-cream font-medium py-2.5 rounded-md transition disabled:opacity-60"
            >
              {pending ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div id="google-signin-button" className="flex justify-center"></div>
        <p className="text-xs text-muted-foreground text-center mt-5">
          Sign in securely with your Google account.
        </p>
      </div>
    </div>
  );
};

const Field = ({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
    />
  </div>
);

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.09-1.93 3.22-4.77 3.22-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.12A6.99 6.99 0 0 1 5.47 12c0-.74.13-1.45.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.42 3.46 1.18 4.96l3.66-2.84C6.71 7.33 9.14 5.4 12 5.4z"
    />
    <path
      fill="#EA4335"
      d="M12 5.4c1.62 0 3.07.56 4.21 1.64l3.16-3.16C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.33 9.14 5.4 12 5.4z"
    />
  </svg>
);
const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z" />
  </svg>
);

export default Auth;
