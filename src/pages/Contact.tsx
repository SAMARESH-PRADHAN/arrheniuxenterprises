import { useState } from "react";
import { MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ADDRESS, EMAIL, MAPS_URL, WHATSAPP_DISPLAY, waLink } from "@/data/site";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", product: "", qty: "", note: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `New Inquiry — Arrheniux
Name: ${form.name}
Phone: ${form.phone}
Product: ${form.product}
Quantity: ${form.qty}
Note: ${form.note}`;
    window.open(waLink(msg), "_blank");
  };

  return (
    <Layout>
      <section className="bg-primary text-cream">
        <div className="container-x py-16">
          <span className="text-xs font-bold uppercase tracking-widest text-cream/60">Get in touch</span>
          <h1 className="font-display text-6xl md:text-8xl leading-none mt-3">LET'S TALK<br /><span className="text-cream/50">CUSTOM.</span></h1>
        </div>
      </section>

      <section className="container-x py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl mb-6">VISIT OR REACH US</h2>
          <ul className="space-y-5">
            <li className="flex gap-4">
              <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <div className="font-bold uppercase text-xs tracking-wide">Office</div>
                <p className="text-muted-foreground">{ADDRESS}</p>
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="text-primary text-sm underline">Open in Maps →</a>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <div className="font-bold uppercase text-xs tracking-wide">Phone / WhatsApp</div>
                <a href={`tel:${WHATSAPP_DISPLAY}`} className="text-muted-foreground hover:text-ink">{WHATSAPP_DISPLAY}</a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <div className="font-bold uppercase text-xs tracking-wide">Email</div>
                <a href={`mailto:${EMAIL}`} className="text-muted-foreground hover:text-ink">{EMAIL}</a>
              </div>
            </li>
          </ul>

          <div className="mt-8 aspect-video w-full overflow-hidden border border-border">
            <iframe
              title="Arrheniux Location"
              src=  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3740.8244653511492!2d85.8488986!3d20.348869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19098ecb4cc93d%3A0xb656dd877d295f01!2sArrheniux%20Enterprises!5e0!3m2!1sen!2sin!4v1784302802853!5m2!1sen!2sin"

              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="bg-secondary p-8">
          <h2 className="font-display text-3xl mb-6">QUICK INQUIRY</h2>
          <p className="text-sm text-muted-foreground mb-6">Fill out the form — we'll continue the chat on WhatsApp.</p>
          <form onSubmit={submit} className="space-y-4">
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border px-4 py-3" />
            <input required placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border border-border px-4 py-3" />
            <input required placeholder="Product (e.g. Hoodies)" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full bg-background border border-border px-4 py-3" />
            <input required type="number" placeholder="Quantity" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className="w-full bg-background border border-border px-4 py-3" />
            <textarea placeholder="Tell us more (sizes, colors, deadline)..." rows={4} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full bg-background border border-border px-4 py-3" />
            <button type="submit" className="btn-wa w-full justify-center !py-4">
              <MessageCircle className="h-5 w-5" /> Send via WhatsApp
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
