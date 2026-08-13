import { memo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Product, waLink } from "@/data/site";

export const ProductCard = memo(({ p, hidePrice = false }: { p: Product; hidePrice?: boolean }) => (  <div className="tilt-card">
    <div className="tilt-card-inner group flex flex-col bg-card border border-border">
      <Link to={`/product/${p.id}`} className="flex flex-col flex-1">
        <div className="relative block overflow-hidden bg-secondary">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {p.isNew && (
            <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] font-bold uppercase tracking-widest px-2 py-1">
              New
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-condensed text-xl tracking-wide leading-tight">{p.name.toUpperCase()}</h3>
          <p className="text-xs text-muted-foreground">{p.fabric} · {p.gsm}</p>
         <div className="flex items-center justify-between mt-auto pt-3">
  {hidePrice ? (
    <span />
  ) : (
    <span className="font-display text-lg">
      {p.price}
      <span className="text-xs font-sans text-muted-foreground">/pc</span>
    </span>
  )}
  <a
    href={waLink(`Hi Arrheniux, I'd like to order: ${p.name}. Quantity: 20+ pieces.`)}
    target="_blank"
    rel="noreferrer"
    onClick={(e) => e.stopPropagation()}
    className="text-[hsl(var(--whatsapp))] hover:text-ink transition"
    aria-label="Order on WhatsApp"
  >
    <MessageCircle className="h-5 w-5" />
  </a>
</div>
        </div>
      </Link>
    </div>
  </div>
));
ProductCard.displayName = "ProductCard";