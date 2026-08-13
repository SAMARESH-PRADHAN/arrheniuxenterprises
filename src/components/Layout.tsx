import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Premium ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-ambient" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-grain opacity-[0.035]" />
      <Navbar />
      <main key={pathname} className="flex-1 page-enter">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
