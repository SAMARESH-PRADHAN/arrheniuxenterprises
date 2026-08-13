import { MessageCircle, Truck, Factory, Package } from "lucide-react";
import { waLink } from "@/data/site";

// Public path — must match <link rel="preload"> in index.html
const HERO_SRC = "/hero-model.avif";

export const Hero = () => (
  <section className="relative bg-primary text-primary-foreground overflow-hidden">
    <div className="container-x grid lg:grid-cols-2 gap-8 py-12 md:py-20 relative">
      <div className="flex flex-col justify-center z-10 order-2 lg:order-1">
        <h1 className="font-display text-[14vw] sm:text-[10vw] lg:text-[7.5vw] leading-[0.9] mt-6 tracking-tighter">
          CUSTOM
          <br />
          APPAREL
          <br />
          FOR YOUR
          <br />
          <span className="text-gradient-anim">BRAND.</span>
        </h1>
        <p className="mt-6 max-w-md text-cream/80 text-base md:text-lg">
          Factory-direct t-shirts, hoodies, uniforms & merch — printed, embroidered and shipped from
          our Bhubaneswar facility.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href={waLink()} target="_blank" rel="noreferrer" className="btn-wa btn-magnetic">
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </a>
        </div>
        <div className="flex flex-wrap gap-6 mt-10 text-xs text-cream/70 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Pan India Delivery
          </span>
          <span className="flex items-center gap-2">
            <Factory className="h-4 w-4" /> Factory Direct
          </span>
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" /> 7–14 Day TAT
          </span>
        </div>
      </div>
      <div className="relative order-1 lg:order-2 min-h-[300px] lg:min-h-[600px] overflow-hidden">
        <img
          src={HERO_SRC}
          alt="Model wearing Arrheniux custom hoodie"
          width={1024}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
    <div className="border-t border-cream/10 bg-ink overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap font-condensed text-2xl tracking-widest text-cream/80">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-8">
            T-SHIRTS <span className="text-accent">★</span> HOODIES{" "}
            <span className="text-accent">★</span> UNIFORMS <span className="text-accent">★</span>{" "}
            CAPS <span className="text-accent">★</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);