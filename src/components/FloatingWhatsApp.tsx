import { useEffect, useState } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";
import { waLink } from "@/data/site";

export const FloatingWhatsApp = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-3">
      {/* Scroll to top button — only shows after scrolling down */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream shadow-lg transition-all duration-300 hover:bg-primary hover:-translate-y-0.5 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* WhatsApp button */}
      <a
        href={waLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--whatsapp))] text-white shadow-lg hover:scale-110 transition"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--whatsapp))] opacity-50 animate-ping" />
      </a>
    </div>
  );
};