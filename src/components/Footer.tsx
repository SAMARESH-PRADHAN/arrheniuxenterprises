import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { ADDRESS, EMAIL, WHATSAPP_DISPLAY, waLink } from "@/data/site";
import { catalog } from "@/data/catalog";
import { useState } from "react";
import { InfoModal } from "@/components/InfoModal";

export const Footer = () => {
const [selected, setSelected] = useState<
  keyof typeof infoData | null
>(null);

  const infoData = {
  faq: {
    title: "Frequently Asked Questions",
    content: (
      <>
        <h3 className="font-semibold mb-2">How can I place an order?</h3>
        <p>
          Users can directly place orders through this webiste and make payments through this website.
        </p>

        <h3 className="font-semibold mt-5 mb-2">
          What is the minimum order quantity?
        </h3>
        <p>Minimum order quantity depends on the product catagory you're purchasing.
          However, each products has a differnet minimum quantity requirement.
        </p>

        <h3 className="font-semibold mt-5 mb-2">
          Do you provide custom printing?
        </h3>
        <p>
          Yes. We offer embroidery, sublimation, DTF, and
          other branding options.
        </p>

        <h3 className="font-semibold mt-5 mb-2">
          How long does production take?
        </h3>
        <p>
          Usually 5–10 working days depending on quantity and customization.
        </p>
      </>
    ),
  },

  return: {
    title: "Return Policy",
    content: (
      <>
        <p>
          Customized products cannot be returned unless there is a manufacturing
          defect or incorrect product delivery.
        </p>

        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li>Report issues within 48 hours of delivery.</li>
          <li>Items must be unused and unwashed.</li>
          <li>Replacement is provided after verification.</li>
        </ul>
      </>
    ),
  },

  track: {
    title: "Track Your Order",
    content: (
      <>
        <p>
          To track your order, you can go to the my order section of your profile.
        </p>

        <p className="mt-4">
          Once dispatched, we'll share your courier tracking number via
          WhatsApp.
        </p>
      </>
    ),
  },

  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <p>
          We respect your privacy. Personal information collected during
          enquiries or orders is used only for processing your request.
        </p>

        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li>We never sell customer data.</li>
          <li>Payment information remains secure.</li>
          <li>Contact details are used only for order updates.</li>
        </ul>
      </>
    ),
  },

  terms: {
    title: "Terms of Service",
    content: (
      <>
        <ul className="list-disc ml-6 space-y-2">
          <li>Advance payment is required to confirm orders.</li>
          <li>Production starts after design approval.</li>
          <li>Delivery timelines may vary for bulk orders.</li>
          <li>Customized orders cannot be cancelled after production starts.</li>
        </ul>
      </>
    ),
  },
};

  return (
  <footer className="bg-ink text-cream mt-24">
    <div className="container-x py-16">
      <div className="grid gap-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-3xl tracking-wider">ARRHENIUX</h3>
          <p className="mt-4 text-sm text-cream/70 max-w-xs">
            Factory-direct custom apparel for brands, teams, schools and businesses across India.
          </p>
         <div className="flex gap-3 mt-6">
  {/* Instagram */}
  <a
    href="https://www.instagram.com/arrheniuxofficial/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
    className="p-2 border border-cream/30 hover:bg-cream hover:text-ink transition"
  >
    <Instagram className="h-4 w-4" />
  </a>

  {/* Facebook */}
  <a
    href="https://www.facebook.com/your_page"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
    className="p-2 border border-cream/30 hover:bg-cream hover:text-ink transition"
  >
    <Facebook className="h-4 w-4" />
  </a>

  {/* YouTube */}
  <a
    href="https://www.youtube.com/@your_channel"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="YouTube"
    className="p-2 border border-cream/30 hover:bg-cream hover:text-ink transition"
  >
    <Youtube className="h-4 w-4" />
  </a>
</div>
        </div>

        <div>
          <h4 className="font-condensed text-xl mb-4">CATALOG</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            {catalog.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`} className="hover:text-cream">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-condensed text-xl mb-4">SUPPORT</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/contact" className="hover:text-cream">Contact Us</Link></li>
            <li>
    <button
      onClick={() => setSelected("faq")}
      className="hover:text-cream text-left"
    >
      FAQs
    </button>
  </li>

  <li>
    <button
      onClick={() => setSelected("return")}
      className="hover:text-cream text-left"
    >
      Return Policy
    </button>
  </li>

  <li>
    <button
      onClick={() => setSelected("track")}
      className="hover:text-cream text-left"
    >
      Track Order
    </button>
  </li>

  <li>
    <button
      onClick={() => setSelected("privacy")}
      className="hover:text-cream text-left"
    >
      Privacy Policy
    </button>
  </li>

  <li>
    <button
      onClick={() => setSelected("terms")}
      className="hover:text-cream text-left"
    >
      Terms of Service
    </button>
  </li>
          </ul>
        </div>

        <div>
          <h4 className="font-condensed text-xl mb-4">CONTACT</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {ADDRESS}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> {WHATSAPP_DISPLAY}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /> {EMAIL}</li>
          </ul>
          <a href={waLink()} target="_blank" rel="noreferrer" className="btn-wa mt-5 w-full justify-center">
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-cream/10 text-xs text-cream/50 flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Arrheniux. All rights reserved.</span>
        {/* <span>Made with care in Bhubaneswar.</span> */}
      </div>
    </div>

    <InfoModal
  open={selected !== null}
  onOpenChange={() => setSelected(null)}
  title={selected ? infoData[selected].title : ""}
  content={selected ? infoData[selected].content : null}
/>
  </footer>
);
}