import { Shirt, Palette, CheckCircle2, Truck } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const steps = [
  { icon: Shirt, title: "Choose", desc: "Pick your style, fabric and GSM from our catalog." },
  { icon: Palette, title: "Customize", desc: "Add print, embroidery, tags and packaging." },
  { icon: CheckCircle2, title: "Confirm", desc: "Approve mockup, pay 50% and lock production." },
  { icon: Truck, title: "Deliver", desc: "Pan-India shipping in 7–14 days, tracked." },
];

export const HowItWorks = () => {
  const headerRef = useReveal<HTMLDivElement>();
  return (
  <section className="container-x py-20">
    <div ref={headerRef} className="reveal text-center max-w-2xl mx-auto mb-14">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">05 — Process</span>
      <h2 className="font-display text-5xl md:text-6xl mt-2">HOW IT WORKS</h2>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
      {steps.map((s, i) => (
        <div key={s.title} className="tilt-card">
        <div className="tilt-card-inner bg-background p-8 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between">
            <s.icon className="h-8 w-8 text-primary float-3d" />
            <span className="font-display text-4xl text-muted-foreground/40">0{i + 1}</span>
          </div>
          <h3 className="font-display text-2xl mt-2">{s.title.toUpperCase()}</h3>
          <p className="text-sm text-muted-foreground">{s.desc}</p>
        </div>
        </div>
      ))}
    </div>
  </section>
  );
};