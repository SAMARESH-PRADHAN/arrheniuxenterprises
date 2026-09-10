import { Leaf, Grid3x3, Waves, Hexagon, Gauge, Feather, Shirt, Layers, Sparkles, Target, Heart, ShieldCheck } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import cotton from "@/assets/cotton.avif";
import polycotton from "@/assets/polycotton.avif";
import spun from "@/assets/spun.avif";
import polyster from "@/assets/polyster.avif";
import f2 from "@/assets/f2.avif";

const fabrics = [
  {
    icon: Leaf,
    tag: "Natural Comfort for Everyday",
    title: "Cotton",
    image: cotton,
    accent: "bg-emerald-600",
    accentSoft: "bg-emerald-50 text-emerald-700",
    points: [
      "Natural fiber",
      "Soft and breathable",
      "High absorbency",
      "Comfortable for daily wear",
      "May wrinkle more than synthetic fabrics",
    ],
  },
  {
    icon: Grid3x3,
    tag: "The Right Blend for Real Life",
    title: "Polycotton",
    image: polycotton,
    accent: "bg-primary",
    accentSoft: "bg-primary/10 text-primary",
    points: [
      "Cotton + polyester blend",
      "Balanced comfort and durability",
      "Less wrinkling than cotton",
      "Easy to maintain",
      "Popular for uniforms and workwear",
    ],
  },
  {
    icon: Waves,
    tag: "Smooth, Durable, Versatile",
    title: "Spun / Spun Matty",
    image: spun,
    accent: "bg-teal-700",
    accentSoft: "bg-teal-50 text-teal-700",
    points: [
      "Smooth to slightly textured knit surface",
      "Durable and shape-stable",
      "Comfortable for polos and uniforms",
      "Good print-friendly fabric option",
      "Common in premium T-shirt and polo segments",
    ],
  },
  {
    icon: Hexagon,
    tag: "Built for Performance",
    title: "Polyester",
    image: polyster,
    accent: "bg-accent",
    accentSoft: "bg-accent/10 text-accent",
    points: [
      "Synthetic fiber",
      "Lightweight and quick-drying",
      "Strong and wrinkle resistant",
      "Retains color well",
      "Common in sportswear and performance wear",
    ],
  },
];

const gsmTiers = [
  {
    icon: Feather,
    title: "120–160 GSM",
    tag: "Light",
    desc: "Ideal for lightweight jerseys and event wear.",
    gradient: "from-sky-400 to-sky-600",
  },
  {
    icon: Shirt,
    title: "160–200 GSM",
    tag: "Medium",
    desc: "Suitable for regular T-shirts and uniforms.",
    gradient: "from-primary to-emerald-700",
  },
  {
    icon: Gauge,
    title: "200–240 GSM",
    tag: "Heavy",
    desc: "Good for premium polos and durable wear.",
    gradient: "from-accent to-orange-700",
  },
  {
    icon: Layers,
    title: "240+ GSM",
    tag: "Extra Heavy",
    desc: "Best for thick premium garments and sweatshirts.",
    gradient: "from-ink to-zinc-700",
  },
];

const usageGuide = [
  { fabric: "Cotton", image: cotton, min: 180, max: 240, gradient: "from-emerald-600 to-emerald-700" },
  { fabric: "Polycotton", image: polycotton, min: 180, max: 240, gradient: "from-primary to-primary/70" },
  { fabric: "Spun / Spun Matty", image: spun, min: 180, max: 240, gradient: "from-teal-700 to-teal-800" },
  { fabric: "Polyester", image: polyster, min: 120, max: 180, gradient: "from-slate-700 to-slate-900" },
];
const SCALE_MIN = 100;
const SCALE_MAX = 260;
const pct = (v: number) => Math.round(((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100);

const benefits = [
  { icon: Target, title: "Right GSM — Right Purpose", desc: "Matched to how and where the garment will be worn." },
  { icon: Heart, title: "Better Comfort", desc: "Weight and feel tuned for all-day wearability." },
  { icon: ShieldCheck, title: "Longer Durability", desc: "Holds shape and colour wash after wash." },
];

export const HowItWorks = () => {
  const headerRef = useReveal<HTMLDivElement>();
  const gsmHeaderRef = useReveal<HTMLDivElement>();

  return (
    <>
      {/* ===== Fabric Details — bold, color-coded, no hover gimmicks ===== */}
      <section className="container-x py-20">
        <div ref={headerRef} className="reveal text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">
            05 — Fabric Guide
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-3">
            <span className="text-gradient-anim">FABRIC</span> DETAILS
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Different fabrics, unique advantages — pick what fits your brief.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {fabrics.map((f, i) => (
            <div
              key={f.title}
              className="relative flex gap-5 rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm overflow-hidden"
            >
              {/* colored left accent bar */}
              <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${f.accent}`} />

              {/* huge faint number in the corner */}
              <span className="pointer-events-none absolute -right-2 -top-4 font-display text-8xl text-muted-foreground/[0.07] select-none">
                0{i + 1}
              </span>

              {/* image block */}
              <div className="shrink-0 relative z-10">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={`-mt-5 ml-3 relative flex h-10 w-10 items-center justify-center rounded-full ${f.accent} text-cream shadow-md ring-4 ring-card`}
                >
                  <f.icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${f.accentSoft}`}
                >
                  {f.tag}
                </span>
                <h3 className="font-display text-3xl leading-none mt-2.5">{f.title}</h3>
                <ul className="mt-4 space-y-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${f.accent} shrink-0`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap font-semibold">
            Same Fabric · Different Possibilities
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </section>

      {/* ===== GSM Details ===== */}
      <section className="relative bg-secondary py-20 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="container-x relative">
          <div ref={gsmHeaderRef} className="reveal text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> 06 — Weight Matters
            </span>
            <h2 className="font-display text-5xl md:text-6xl mt-3">
              <span className="text-gradient-anim">GSM</span> DETAILS
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
              GSM = Grams per Square Meter. Lower GSM means a lighter fabric; higher GSM
              means a thicker, heavier one.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gsmTiers.map((s, i) => (
              <div key={s.title} className="tilt-card">
                <div className="tilt-card-inner relative overflow-hidden rounded-xl border border-border bg-background p-6 flex flex-col gap-3 h-full shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div
                    className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-xl`}
                  />
                  <div className="flex items-center justify-between relative">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${s.gradient} text-cream shadow-md float-3d`}
                    >
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-3xl text-muted-foreground/30">
                      0{i + 1}
                    </span>
                  </div>
                  <span
                    className={`inline-block w-fit text-[10px] font-bold uppercase tracking-widest text-cream bg-gradient-to-r ${s.gradient} px-2.5 py-1 rounded-full shadow-sm`}
                  >
                    {s.tag}
                  </span>
                  <h3 className="font-display text-xl mt-1 leading-tight">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-5">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shrink-0">
                  <Layers className="h-5 w-5 text-cream" />
                </span>
                <div>
                  <h4 className="font-condensed text-xl tracking-wide">COMMON USAGE GUIDE</h4>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    Typical GSM range by fabric
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {usageGuide.map((u) => (
                  <div
                    key={u.fabric}
                    className="flex items-center gap-4 rounded-xl border border-border/70 bg-background p-3"
                  >
                    <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 relative">
                      <img
                        src={u.image}
                        alt={u.fabric}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${u.gradient} opacity-30`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-sm truncate">{u.fabric}</span>
                        <span
                          className={`shrink-0 text-[10px] font-bold text-cream bg-gradient-to-r ${u.gradient} px-2.5 py-1 rounded-full shadow-sm`}
                        >
                          {u.min}–{u.max} GSM
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`absolute inset-y-0 rounded-full bg-gradient-to-r ${u.gradient}`}
                          style={{
                            left: `${pct(u.min)}%`,
                            width: `${pct(u.max) - pct(u.min)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-ink shadow-lg min-h-[320px]">
              <img
                src={f2}
                alt="Premium fabric detail"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20" />

              <div className="shine-sweep relative z-10 h-full flex flex-col justify-end p-6 md:p-7 text-cream">
                <span className="inline-flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase tracking-widest text-cream bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 ring-1 ring-white/20">
                  <Sparkles className="h-3 w-3" /> Why It Matters
                </span>
                <h4 className="font-condensed text-2xl tracking-wide mb-4">BENEFITS</h4>
                <ul className="space-y-3.5">
                  {benefits.map((b) => (
                    <li key={b.title} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20 shrink-0">
                        <b.icon className="h-4 w-4 text-accent" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{b.title}</div>
                        <div className="text-[11px] text-cream/70 mt-0.5">{b.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap font-semibold">
              Same Fabric · Different Possibilities
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
          </div>
        </div>
      </section>
    </>
  );
};