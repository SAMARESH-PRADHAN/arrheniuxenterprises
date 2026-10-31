import { Sparkles, Shirt, BadgePercent } from "lucide-react";

// ✏️ EDIT YOUR MESSAGES HERE
const MESSAGES = [
  {
    icon: Shirt,
    text: "We provide customised top wear",
  },
  {
    icon: Sparkles,
    text: "ARRHENIUX special exclusive ready-made products",
  },
  {
    icon: BadgePercent,
    text: "Every customised product has discount up to 40%",
    highlight: true, // makes this one stand out
  },
];

const Group = () => (
  <div className="flex shrink-0 items-center">
    {MESSAGES.map((m, i) => (
      <span key={i} className="mx-6 flex items-center gap-2.5 md:mx-10">
        <m.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        {m.highlight ? (
          <span className="rounded-full bg-gradient-to-r from-accent to-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-cream shadow-[0_0_14px_hsl(var(--accent)/0.55)] md:text-xs">
            {m.text}
          </span>
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-cream/90 md:text-xs">
            {m.text}
          </span>
        )}
        <span className="ml-6 text-accent md:ml-10" aria-hidden="true">★</span>
      </span>
    ))}
  </div>
);

export const AnnouncementBar = () => (
  <div className="group relative w-full overflow-hidden bg-ink py-2.5">
    {/* soft edge fade */}
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink to-transparent" />

    {/* Two identical groups = seamless loop (animation moves -50%) */}
    <div
      className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]"
      style={{ animationDuration: "35s" }}
    >
      <Group />
      <Group />
    </div>
  </div>
);