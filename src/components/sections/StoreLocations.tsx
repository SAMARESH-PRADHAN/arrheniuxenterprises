import { MapPin, Phone, ExternalLink } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
type Store = {
  name: string;
  address: string;
  phone?: string;
  mapsUrl?: string;
  image?: string;
};

const STORES: Store[] = [
  {
    name: "Arrheniux HQ — Bhubaneswar",
    address: "Niladri Vihar, Bhubaneswar, Odisha 751021",
    phone: "+91 82603 68742",
    mapsUrl: "https://maps.app.goo.gl/oh4CuRvus1gfH4D49",
  },
  {
    name: "Arrheniux Factory — Cuttack",
    address: "Jagatpur Industrial Estate, Cuttack, Odisha 754021",
    phone: "+91 82603 68742",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jagatpur+Industrial+Estate+Cuttack",
  },
  {
    name: "Arrheniux Studio — Kolkata",
    address: "Salt Lake Sector V, Kolkata, West Bengal 700091",
    phone: "+91 82603 68742",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Salt+Lake+Sector+V+Kolkata",
  },
];

export const StoreLocations = () => {
  const headerRef = useReveal<HTMLDivElement>();
  return (
  <section className="container-x py-20">
    <div ref={headerRef} className="reveal flex items-end justify-between mb-10 flex-wrap gap-4">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cream bg-gradient-to-r from-primary to-accent px-3 py-1.5 rounded-full shadow-sm">09 — Our Store Locations</span>
        <h2 className="font-display text-5xl md:text-6xl mt-2">FIND US NEAR YOU.</h2>
      </div>
      <p className="text-muted-foreground max-w-md text-sm">
        Walk into any Arrheniux location to see fabrics, samples and production in person. Our team is happy to help with custom briefs.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {STORES.map((s) => (
        <div key={s.name} className="tilt-card">
        <div
          className="tilt-card-inner group border border-border bg-card p-6 hover:border-ink transition flex flex-col h-full"
        >
          <div className="flex items-start gap-3">
            <span className="h-10 w-10 inline-flex items-center justify-center bg-secondary border border-border group-hover:bg-ink group-hover:text-cream transition shrink-0">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-condensed text-xl tracking-wide leading-tight">{s.name.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.address}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 text-sm">
            {s.phone && (
              <a href={`tel:${s.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 text-ink hover:text-primary transition">
                <Phone className="h-4 w-4" /> {s.phone}
              </a>
            )}
            {s.mapsUrl && (
              <a
                href={s.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold underline underline-offset-4 mt-1 text-primary"
              >
                Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
       </div>
        </div>
      ))}
    </div>
  </section>
  );
};