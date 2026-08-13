import { Factory, Scissors, Truck, ShieldCheck, BadgeIndianRupee, Headphones, Sparkles, Boxes } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
export const WhyWhatWho = () => {
  const introRef = useReveal<HTMLDivElement>();
  const whatRef = useReveal<HTMLDivElement>();
  const whyRef = useReveal<HTMLDivElement>();
  return (
  <>
    <section className="container-x py-20">
      <div ref={introRef} className="reveal grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">06 — Who We Are</span>
          <h2 className="font-display text-5xl md:text-6xl mt-2 leading-none">
            BUILT FOR <span className="text-primary">BULK.</span><br/>OBSESSED WITH FIT.
          </h2>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed">
          Arrheniux is a Bhubaneswar-based apparel manufacturing house serving brands, corporates, institutions and event organizers across India. Our vision is simple — replace the inconsistent middleman supply chain with a single, transparent factory that delivers premium custom apparel on time, every time.
        </p>
      </div>
    </section>

    <section className="bg-secondary py-20">
      <div className="container-x">
        <div ref={whatRef} className="reveal flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">07 — What We Do</span>
            <h2 className="font-display text-5xl md:text-6xl mt-2">END-TO-END APPAREL.</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Factory, title: "Manufacturing", text: "In-house cut, stitch, finish across 12 product lines." },
            { icon: Sparkles, title: "Customization", text: "Pick fabric, GSM, colour, fit and finish — built to spec." },
            { icon: Scissors, title: "Branding & Print", text: "Screen, DTF, sublimation, embroidery and neck labels." },
            { icon: Boxes, title: "Bulk Production", text: "20 to 50,000 pcs — same QC, same timeline discipline." },
          ].map((s) => (
            <div key={s.title} className="glow-hover bg-background border border-border p-6 hover:border-ink hover:-translate-y-0.5 transition">
             <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
  <s.icon className="h-6 w-6 text-cream float-3d" />
</div>
              <h3 className="font-condensed text-2xl mt-4 tracking-wide">{s.title.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="container-x py-20">
      <div ref={whyRef} className="reveal flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">08 — Why We Are Different</span>
          <h2 className="font-display text-5xl md:text-6xl mt-2">OUR ADVANTAGE.</h2>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { icon: Sparkles, title: "Premium Quality", text: "Hand-picked fabrics, double-stitched seams, retail-grade finishing." },
          { icon: Boxes, title: "Bulk Manufacturing", text: "Capacity for 50K+ pcs/month without compromising fit." },
          { icon: Truck, title: "Fast Delivery", text: "7–14 day turnaround on most orders — pan-India dispatch." },
          { icon: BadgeIndianRupee, title: "Affordable Pricing", text: "Factory-direct rates — no middlemen, no markups." },
          { icon: ShieldCheck, title: "Quality Inspection", text: "Multi-stage QC on every piece before it ships." },
          { icon: Headphones, title: "Dedicated Support", text: "One account manager from sample to delivery." },
        ].map((s) => (
          <div key={s.title} className="tilt-card">
          <div className="tilt-card-inner border border-border p-6 bg-card hover:border-primary transition h-full">
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
  <s.icon className="h-6 w-6 text-cream float-3d" />
</div>
            <h3 className="font-condensed text-2xl mt-4 tracking-wide">{s.title.toUpperCase()}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.text}</p>
          </div>
          </div>
        ))}
      </div>
    </section>
  </>
  );
};
  