// import { memo } from "react";
// import { Link } from "react-router-dom";
// import { MessageCircle } from "lucide-react";
// import { Product, waLink } from "@/data/site";

// export const ProductCard = memo(({ p, hidePrice = false }: { p: Product; hidePrice?: boolean }) => (  <div className="tilt-card">
//     <div className="tilt-card-inner group flex flex-col bg-card border border-border">
//       <Link to={`/product/${p.id}`} className="flex flex-col flex-1">
//         <div className="relative block overflow-hidden bg-secondary">
//           <img
//             src={p.image}
//             alt={p.name}
//             loading="lazy"
//             className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
//           />
//           {p.isNew && (
//             <span className="absolute top-3 left-3 bg-ink text-cream text-[10px] font-bold uppercase tracking-widest px-2 py-1">
//               New
//             </span>
//           )}
//         </div>
//         <div className="p-4 flex flex-col gap-2 flex-1">
//           <h3 className="font-condensed text-xl tracking-wide leading-tight">{p.name.toUpperCase()}</h3>
//           <p className="text-xs text-muted-foreground">{p.fabric} · {p.gsm}</p>
//          <div className="flex items-center justify-between mt-auto pt-3">
//   {hidePrice ? (
//     <span />
//   ) : (
//     <span className="font-display text-lg">
//       {p.price}
//       <span className="text-xs font-sans text-muted-foreground">/pc</span>
//     </span>
//   )}
//   <a
//     href={waLink(`Hi Arrheniux, I'd like to order: ${p.name}. Quantity: 20+ pieces.`)}
//     target="_blank"
//     rel="noreferrer"
//     onClick={(e) => e.stopPropagation()}
//     className="text-[hsl(var(--whatsapp))] hover:text-ink transition"
//     aria-label="Order on WhatsApp"
//   >
//     <MessageCircle className="h-5 w-5" />
//   </a>
// </div>
//         </div>
//       </Link>
//     </div>
//   </div>
// ));
// ProductCard.displayName = "ProductCard";


import { memo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Product, waLink } from "@/data/site";

// Categories that do NOT get the 40% discount (they have no bulk discount in your pricing logic)
const NO_DISCOUNT_CATEGORIES = [
  "arrheniux-t-shirts",
  "custom-accessories",
  "corporate-welcome-kit",
  "new-collection",
];

// ✏️ Change this text if the discount % changes
const DISCOUNT_TEXT = "discount up to 40%";

export const ProductCard = memo(({ p, hidePrice = false }: { p: Product; hidePrice?: boolean }) => {
  const categorySlug = (p as any).categorySlug as string | undefined;
  const showDiscount =
    !hidePrice && !(categorySlug && NO_DISCOUNT_CATEGORIES.includes(categorySlug));

  return (
    <div className="tilt-card">
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
            <div className="flex items-end justify-between mt-auto pt-3 gap-2">
              {hidePrice ? (
                <span />
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="font-display text-lg leading-none">
                    {p.price}
                    <span className="text-xs font-sans text-muted-foreground">/pc</span>
                  </span>
                  {showDiscount && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-accent to-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cream shadow-md">
  ({DISCOUNT_TEXT})
</span>
                  )}
                </div>
              )}
              <a
                href={waLink(`Hi Arrheniux, I'd like to order: ${p.name}. Quantity: 20+ pieces.`)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[hsl(var(--whatsapp))] hover:text-ink transition shrink-0"
                aria-label="Order on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
});
ProductCard.displayName = "ProductCard";