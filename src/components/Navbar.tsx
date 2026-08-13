import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User as UserIcon,
  ChevronDown,
  Home,
  Sparkles,
  Info,
  MessageSquare,
  Building2,
  Mail,
  ClipboardList,
  Shield,
  LayoutGrid,
  Package,
  MapPin
} from "lucide-react";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { BulkMegaMenu } from "./BulkMegaMenu";
import { UserMenu } from "./UserMenu";
import { catalog } from "@/data/catalog";
import { getSession, clearSession } from "@/lib/session";

// Final order: Home, Categories, New Collection, Bulk Order, B2B Shop, About Us, Client Reactions, Contact
export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileBulkOpen, setMobileBulkOpen] = useState(false);
  const [user, setUser] = useState(getSession());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUser(getSession());
  }, [location.pathname]);

  const handleHashClick = useCallback(
    (e: React.MouseEvent, hash: string) => {
      e.preventDefault();
      setOpen(false);
      if (location.pathname !== "/") {
        navigate(`/${hash}`);
        return;
      }
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", hash);
    },
    [location.pathname, navigate],
  );

  const handleLogout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/");
  }, [navigate]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary ${
      isActive ? "text-primary" : "text-ink"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all relative ${
        scrolled
          ? "navbar-glass navbar-scrolled bg-cream/85 shadow-[0_4px_24px_-8px_hsl(0_0%_8%/0.15)]"
          : "bg-cream"
      }`}
    >
      <span className="navbar-glow-line" aria-hidden="true" />
      <div className="container-x flex items-center justify-between py-4 gap-4">
        <div className="shrink-0 logo-glow">
          <Logo />
        </div>

        <nav className="hidden xl:flex items-center gap-5 flex-1 justify-center">
          <a
            href="#home"
            onClick={(e) => handleHashClick(e, "#home")}
            className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" /> Home
          </a>
          <MegaMenu />
          <a
            href="#collection"
            onClick={(e) => handleHashClick(e, "#collection")}
            className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> New
            Collection
          </a>
          <BulkMegaMenu />
          <NavLink to="/b2b-shop" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> B2B Shop
            </span>
          </NavLink>
          <a
            href="#about-us"
            onClick={(e) => handleHashClick(e, "#about-us")}
            className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1.5"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" /> About Us
          </a>
          <a
            href="#reviews"
            onClick={(e) => handleHashClick(e, "#reviews")}
            className="nav-link-underline text-sm font-medium uppercase tracking-wide transition hover:text-primary text-ink inline-flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Client
            Reactions
          </a>
          <NavLink to="/contact" className={navLinkClass}>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Contact
            </span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} onChange={() => setUser(getSession())} />
            </div>
          ) : (
            <Link
  to="/auth"
  className="shine-sweep btn-magnetic hidden md:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cream px-4 py-2.5 rounded-full bg-gradient-to-r from-primary via-primary to-accent bg-[length:200%_auto] hover:bg-[position:100%_0] transition-[background-position,transform] duration-500 shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)]"
>
  <UserIcon className="h-3.5 w-3.5" aria-hidden="true" /> Log In
</Link>
          )}
          <button
            className="xl:hidden p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu-enter xl:hidden border-t border-border navbar-glass bg-cream/95">
          <div className="container-x py-4 flex flex-col gap-3">
            {!user ? (
             <Link
  to="/auth"
  onClick={() => setOpen(false)}
  className="shine-sweep btn-magnetic inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-cream px-4 py-2.5 rounded-full bg-gradient-to-r from-primary via-primary to-accent"
>
  <UserIcon className="h-4 w-4" aria-hidden="true" /> Log In / Sign Up
</Link>
            ) : (
              <div className="flex items-center justify-between py-2 gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] uppercase text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="text-xs font-medium underline shrink-0"
                >
                  Log out
                </button>
              </div>
            )}
            {user && (
  <>
    <Link
      to="/my-orders"
      onClick={() => setOpen(false)}
      className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
    >
      <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> My
      Orders
    </Link>
    <Link
      to="/my-addresses"
      onClick={() => setOpen(false)}
      className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
    >
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> My Address
    </Link>
  </>
)}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="py-2 font-semibold uppercase text-sm tracking-wide text-primary inline-flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Admin
                Panel →
              </Link>
            )}
            <a
              href="#home"
              onClick={(e) => handleHashClick(e, "#home")}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" /> Home
            </a>
            <button
              onClick={() => setMobileCatOpen((v) => !v)}
              className="py-2 font-medium uppercase text-sm tracking-wide flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                Categories
              </span>{" "}
              <ChevronDown
                className={`h-4 w-4 transition ${mobileCatOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileCatOpen && (
              <div className="pl-3 border-l border-border flex flex-col gap-1 mb-2">
                {catalog.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            <a
              href="#collection"
              onClick={(e) => handleHashClick(e, "#collection")}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> New
              Collection
            </a>
            <button
              onClick={() => setMobileBulkOpen((v) => !v)}
              className="py-2 font-medium uppercase text-sm tracking-wide flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" aria-hidden="true" /> Bulk
                Order
              </span>{" "}
              <ChevronDown
                className={`h-4 w-4 transition ${mobileBulkOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileBulkOpen && (
              <div className="pl-3 border-l border-border flex flex-col gap-1 mb-2">
                <Link
                  to="/bulk-order"
                  onClick={() => setOpen(false)}
                  className="py-1.5 text-xs uppercase tracking-wide font-semibold text-primary"
                >
                  Bulk Order Home
                </Link>
                {catalog
                  .filter((c) => c.slug !== "arrheniux-t-shirts")
                  .map((c) => (
                    <Link
                      key={c.slug}
                      to={`/bulk-order?cat=${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="py-1.5 text-xs uppercase tracking-wide text-muted-foreground hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  ))}
              </div>
            )}
            <Link
              to="/b2b-shop"
              onClick={() => setOpen(false)}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> B2B Shop
            </Link>
            <a
              href="#about-us"
              onClick={(e) => handleHashClick(e, "#about-us")}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" /> About Us
            </a>
            <a
              href="#reviews"
              onClick={(e) => handleHashClick(e, "#reviews")}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />{" "}
              Client Reactions
            </a>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="py-2 uppercase text-sm tracking-wide font-medium inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
