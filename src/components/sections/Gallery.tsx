import g1 from "@/assets/gi1.avif";
import g2 from "@/assets/gi2.avif";
import g3 from "@/assets/gi3.avif";
import g4 from "@/assets/gi4.avif";
import g5 from "@/assets/gi5.avif";
import g6 from "@/assets/gi6.avif";
import g7 from "@/assets/gi7.avif";
import g8 from "@/assets/gi8.avif";
import g9 from "@/assets/gi9.avif";
import g10 from "@/assets/gi10.avif";
import g11 from "@/assets/gi1.avif";
import g12 from "@/assets/gi12.avif";
import { useReveal } from "@/hooks/useReveal";

const items = [
  { img: g1, tag: "Education",},
  { img: g2, tag: "Corporate",},
  { img: g3, tag: "Streetwear",},
  { img: g4, tag: "College",},
  { img: g5, tag: "Sports", },
  { img: g6, tag: "Tech", },
  { img: g7, tag: "Tech", },
  { img: g8, tag: "Tech", },
  { img: g9, tag: "Tech", },
  { img: g10, tag: "Tech", },
  { img: g11, tag: "Tech", },
  { img: g12, tag: "Tech", },
];

export const Gallery = () => {
  const headerRef = useReveal<HTMLDivElement>();
  return (
  <section className="bg-secondary py-20">
    <div className="container-x">
      <div ref={headerRef} className="reveal flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">03 — Clients</span>
          <h2 className="font-display text-5xl md:text-6xl mt-2">CLIENTS WITH WORK</h2>
        </div>
        <p className="max-w-sm text-muted-foreground text-sm">
          From college fests to corporate uniforms, here's a glimpse of what we've made.
        </p>
      </div>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="tilt-card break-inside-avoid">
          <figure className="tilt-card-inner relative group overflow-hidden bg-background">
            <img src={it.img} loading="lazy" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/90 to-transparent text-cream">
              {/* <span className="text-[10px] uppercase tracking-widest text-accent">{it.tag}</span> */}
              {/* <p className="font-condensed text-lg leading-tight">{it.client}</p> */}
            </figcaption>
          </figure>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};