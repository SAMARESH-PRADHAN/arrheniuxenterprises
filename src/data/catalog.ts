import tshirts from "@/assets/over-shirt-arr .avif";
import hoodies from "@/assets/hoodiearr.avif";
import roundneck from "@/assets/round-nake-2.avif"
import jersy from "@/assets/jersy.avif"
import polos from "@/assets/polo.avif";
import Aprons from "@/assets/approns (1).avif";
import sweatshirts from "@/assets/cat-sweatshirts.jpg";
import jeans from "@/assets/cat-jeans.jpg";
import joggers from "@/assets/cat-joggers.jpg";
import caps from "@/assets/cat-caps.jpg";
import shorts from "@/assets/cat-shorts.jpg";
import jackets from "@/assets/cat-jackets.jpg";
import totes from "@/assets/custom-accessories (1).avif";
import uniforms from "@/assets/uniform.avif";
import corporate from "@/assets/corporate.avif";
import corporatewelcoome from "@/assets/corpo-welcome-kit (1).avif";
import canvasTote from "@/assets/canvasTote.avif";
import mug from "@/assets/mugs.avif";
import safetyGoggle from "@/assets/safetyGoggle.avif";
import cap from "@/assets/caps (1).avif";
import premiumBackpack from  "@/assets/premiumBackpack.avif";
import umbrella from "@/assets/umbrella (1).avif";
import pen from "@/assets/pen (1).avif";
import badge from "@/assets/badge (1).avif";
import eventLanyard from "@/assets/eventLanyard (1).avif";
import bottle from "@/assets/bottle (1).avif";
import polytshirts from "@/assets/Polycotton Oversized T-Shirts sub.avif";
import premiumover from "@/assets/premiumover (1).avif";
import americanFleeceHoodie from "@/assets/americanFleeceHoodie (1).avif";
import cottonHoodie from "@/assets/cotton-50kb.avif";
import Loopnet from "@/assets/Loopnet (1).avif";
import jerseyAllOverRegular  from "@/assets/jerseyAllOverRegular.avif";
import jerseyFrontRegular from "@/assets/jerseyFrontRegular.avif";
import jerseyFrontBackRegular from "@/assets/jerseyFrontBackRegular.avif";
import spunRoundNeck from "@/assets/spunRoundNeck.avif";
import corporatePolyesterRoundNeck from "@/assets/corporatePolyesterRoundNeck.avif";
import dotnetWhiteRoundNeck from "@/assets/dotnetWhiteRoundNeck.avif";
import gymRoundNeck from "@/assets/gymRoundNeck.avif";
import universityApron from "@/assets/university-apron.avif";
import nurseApron from "@/assets/nurse-apron.avif";
import medicalApron from "@/assets/medical-apron.avif";
import classicWelcomeKit from "@/assets/classic-welcome-kit.avif";
//b2b images
// import dryFitCollar from "@/assets/dry-fit-collar.avif";
// import solidCollar from "@/assets/solid-collar.avif";
// import dryFitSolidCollar from "@/assets/dry-fit-solid-collar.avif";

export type Tier = "regular" | "premium";

export type CatalogProduct = {
  id: string;
   code: string;   // ← added  this
  name: string;
  categorySlug: string;
  subSlug: string;
  tier?: Tier;
  fabric: string;
  gsm: string;
  moq: number;
  price: string;
  samplePrice: number;
  image: string;
  gallery: string[];
  colors: string[];
  description: string;
  material: string;
  isNew?: boolean;
  addedAt: number;
  overview?: string;
  specifications?: string[];
  designGuidelines?: string[];
  washCare?: string[];
   kitItems?: { name: string; price: number }[]; // ADD THIS
};

export type Subcategory = {
  slug: string;
  name: string;
  tier?: Tier;
  image: string;
  products: CatalogProduct[];
};

export type CatalogCategory = {
  slug: string;
  name: string;
  image: string;
  hasTiers: boolean;
  blurb: string;
  regular?: Subcategory[];
  premium?: Subcategory[];
  items?: Subcategory[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const DEFAULT_COLORS = ["#f5f1e8", "#1a1a1a", "#2a5d3e", "#c97a4a"];

let __id = 0;
let __ts = Date.now();

const makeProducts = (
  baseName: string,
  catSlug: string,
  subSlug: string,
  image: string,
  tier: Tier | undefined,
  count = 3
): CatalogProduct[] => {
  const out: CatalogProduct[] = [];
  for (let i = 1; i <= count; i++) {
    __id++;
    __ts += 1000;
    const priceBase = tier === "premium" ? 540 : 280;
    const price = priceBase + i * 30;
    out.push({
      id: `c${__id}`,
      code: `ARR-${catSlug.substring(0, 3).toUpperCase()}-${String(__id).padStart(4, "0")}`,

      name: count > 1 ? `${baseName} — Style ${i}` : baseName,
      categorySlug: catSlug,
      subSlug,
      tier,
      fabric: baseName,
      gsm: tier === "premium" ? "Premium" : "Standard",
      moq: 20,
      price: `₹${price}`,
      samplePrice: price,
      image,
      gallery: [image, image, image, image, image, image],
      colors: DEFAULT_COLORS,
      description: `${baseName} — engineered for bulk corporate and event orders. Pre-shrunk, bio-washed, made in-house with strict QC.`,
      material: baseName,
      isNew: i === 1,
      addedAt: __ts,
    });
  }
  return out;
};

type SubInput =
  | string
  | {
      name: string;
      image: string;
    };

const makeSubs = (
  catSlug: string,
  defaultImage: string,
  tier: Tier | undefined,
  names: SubInput[],
  perSub = 3
): Subcategory[] =>
  names.map((item) => {
    const name = typeof item === "string" ? item : item.name;
    const image = typeof item === "string" ? defaultImage : item.image;

    const slug = slugify(name);

    return {
      slug,
      name,
      tier,
      image,
      products: makeProducts(name, catSlug, slug, image, tier, perSub),
    };
  });

export const catalog: CatalogCategory[] = [
  {
    slug: "oversized-t-shirts",
    name: "Oversized T-Shirts",
    image: tshirts,
    hasTiers: true,
    blurb: "Drop-shoulder fits in heavy and lightweight builds.",
    regular: makeSubs("oversized-t-shirts", polytshirts, "regular", [
      "Polycotton Oversized T-Shirts",
    ]),
    premium: makeSubs("oversized-t-shirts", premiumover, "premium", [
      "Cotton Oversized T-Shirts",
      { name: "Terry / Loopnet Oversized T-Shirts", image: Loopnet },
      
    ]),
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    image: hoodies,
    hasTiers: true,
    blurb: "Fleece-lined, structured hoods, double-stitched seams.",
    regular: makeSubs("hoodies", hoodies, "regular", ["Spun Fleece Hoodies"]),
    premium: makeSubs("hoodies", hoodies, "premium", [
      "Polycotton Hoodies",
       { name: "American Fleece Hoodies", image: americanFleeceHoodie },
      { name: "Cotton Hoodies", image: cottonHoodie },
    ]),
  },
  {
    slug: "jersey",
    name: "Jersey",
    image: jersy,
    hasTiers: true,
    blurb: "Sublimation-ready jerseys for sports, events and teams.",
    regular: makeSubs("jersey", sweatshirts, "regular", [
      { name: "All Over Printed Jersey", image: jerseyAllOverRegular },
      { name: "Front Printed Jersey", image: jerseyFrontRegular },
      { name: "Front & Back Printed Jersey", image: jerseyFrontBackRegular }
    ]),
    premium: makeSubs("jersey", sweatshirts, "premium", [
      // "All Over Printed Jersey",
      // "Front Printed Jersey",
      // "Front & Back Printed Jersey",
      { name: "All Over Printed Jersey", image: jerseyAllOverRegular },
      { name: "Front Printed Jersey", image: jerseyFrontRegular },
      { name: "Front & Back Printed Jersey", image: jerseyFrontBackRegular }
    ]),
  },
  {
    slug: "custom-fabric-t-shirts",
    name: "Custom Premium Polo T-Shirt",
    image: polos,
    hasTiers: true,
    blurb: "Pick your exact fabric and GSM — built to spec. Minimum 50 pcs.",
    regular: makeSubs("custom-fabric-t-shirts", polos, "regular", [
      "Spun Matty 240 GSM",
      "Spun Matty 220 GSM",
      "Dotnet Polyester 180 GSM",
      "Dotnet Polyester 160 GSM",
      "Dotnet Polyester 120 GSM",
      "Nirmal Net Polyester 120 GSM",
      "Kohili Net Polyester 120 GSM",
    ]),
    premium: makeSubs("custom-fabric-t-shirts", polos, "premium", [
      "240 GSM Cotton Polo T-Shirt",
      "240 GSM Polycotton Polo T-Shirt",
      "240 GSM CP Polo T-Shirt",
      "240 GSM Spun Polo T-Shirt (Polyester)",
      "240 GSM Honeycomb Polo T-Shirt (Polyester)",
      "180 GSM SAP Matty Polo T-Shirt (Premium Polyester)",
      "180 GSM Dotnet Polo T-Shirt (Polyester)",
      "170 GSM Nirmal Net Polo T-Shirt (Polyester)",
    ]),
  },
  {
    slug: "corporate-wear",
    name: "Corporate Wear",
    image: corporate,
    hasTiers: true,
    blurb: "Collar-neck programs for offices, events and field teams.",
    regular: makeSubs("corporate-wear", corporate, "regular", [
      "Spun Collar Neck T-Shirt",
      "Cut & Sew Collar Neck T-Shirts",
      "Corporate Economy Collar Neck T-Shirt",
      "Reunions Collar Neck T-Shirts",
      "Marketing Collar Neck T-Shirts",
      "Petrol Pump Collar Neck T-Shirts",
      "Conference Collar Neck T-Shirts",
      "Gym Collar Neck T-Shirts",
      "Garage Collar Neck T-Shirts",
      "NGO Collar Neck T-Shirts",
      "Dotnet White Collar Neck T-Shirt",
      "Festival Group Collar Neck T-Shirts",
      "Ranglan Collar Neck T-Shirt",
    ]),
    premium: makeSubs("corporate-wear", corporate, "premium", [
      "Cotton Collar Neck T-Shirts",
      "Blended Collar Neck T-Shirts",
      "Drifit SAP Matty Collar Neck T-Shirts",
      "Reunions Collar Neck T-Shirts",
      "Marketing Collar Neck T-Shirts",
      "Petrol Pump Collar Neck T-Shirts",
      "Conference Collar Neck T-Shirts",
      "Gym Collar Neck T-Shirts",
      "Garage Collar Neck T-Shirts",
      "NGO Collar Neck T-Shirts",
      "SAP Matty White Collar Neck T-Shirt",
      "Cut & Sew Collar Neck T-Shirts",
      "Festival Group Collar Neck T-Shirts",
      "SAP Matty Ranglan Collar Neck T-Shirt",
    ]),
  },
  {
    slug: "custom-round-neck-t-shirts",
    name: "Custom Round Neck T-Shirts",
    image: roundneck,
    hasTiers: true,
    blurb: "Classic crew tees across every common fabric build.",
    regular: makeSubs("custom-round-neck-t-shirts", tshirts, "regular", [
      // "Spun Round Neck T-Shirt",
      // "Corporate Polyester Round Neck T-Shirt",
      // "Dotnet White Round Neck T-Shirt",
      // "Gym Round Neck T-Shirt",
{ name: "Spun Round Neck T-Shirt", image: spunRoundNeck },
{ name: "Corporate Polyester Round Neck T-Shirt", image: corporatePolyesterRoundNeck },
{ name: "Dotnet White Round Neck T-Shirt", image: dotnetWhiteRoundNeck },
{ name: "Gym Round Neck T-Shirt", image: gymRoundNeck },

    ]),
    premium: makeSubs("custom-round-neck-t-shirts", tshirts, "premium", [
      // "Cotton Round Neck T-Shirt",
      // "Polycotton Round Neck T-Shirt",
      // "Corporate SAP Matty Round Neck T-Shirt",
      // "SAP Matty White Round Neck T-Shirt",
      // "Cotton Gym Round Neck T-Shirt",
      { name: "Cotton Round Neck T-Shirt", image: spunRoundNeck  },
{ name: "Polycotton Round Neck T-Shirt", image: tshirts },
{ name: "Corporate SAP Matty Round Neck T-Shirt", image: corporatePolyesterRoundNeck },
{ name: "SAP Matty White Round Neck T-Shirt", image: dotnetWhiteRoundNeck },
{ name: "Cotton Gym Round Neck T-Shirt", image: gymRoundNeck },
    ]),
  },
  {
    slug: "aprons",
    name: "Aprons",
    image: Aprons,
    hasTiers: true,
    blurb: "Functional aprons for hospitals, kitchens and universities.",
    regular: makeSubs("aprons", uniforms, "regular", [
      // "University Apron",
      // "Nurse Apron",
      // "Medical Apron",
      { name: "University Apron", image: universityApron },
{ name: "Nurse Apron", image: nurseApron },
{ name: "Medical Apron", image: medicalApron },
    ]),
    premium: makeSubs("aprons", uniforms, "premium", [
      // "University Apron",
      // "Nurse Apron",
      // "Medical Apron",
        { name: "University Apron", image: universityApron },
{ name: "Nurse Apron", image: nurseApron },
{ name: "Medical Apron", image: medicalApron },
    ]),
  },
  {
    slug: "customize-school-uniform",
    name: "Customize School Uniform",
    image: uniforms,
    hasTiers: false,
    blurb: "School uniform T-shirts and track pants — built per your specs.",
    items: makeSubs("customize-school-uniform", uniforms, undefined, [
      "Spun Matty 220 GSM",
      "PC Matty 220 GSM",
      "Track Pant Spun Poly Polyester",
      "Track Pant Cotton PC Loop Knit",
    ], 3),
  },
  {
    slug: "custom-accessories",
    name: "Custom Accessories",
    image: totes,
    hasTiers: false,
    blurb: "Branded merch and add-ons to round out your kit.",
    items: makeSubs("custom-accessories", undefined, undefined, [
  { name: "Canvas Tote", image: canvasTote },
  { name: "Mug", image: mug },
  { name: "Safety Goggle", image: safetyGoggle },
  { name: "Cap", image: cap },
  { name: "Premium Backpack", image: premiumBackpack },
  { name: "Umbrella", image: umbrella },
  { name: "Pen", image: pen },
  { name: "Badge", image: badge },
  { name: "Event Lanyard", image: eventLanyard },
  { name: "Bottle", image: bottle },
], 2),
    
  },
  {
    slug: "corporate-welcome-kit",
    name: "Corporate Welcome Kit",
    image: corporatewelcoome,
    hasTiers: false,
    blurb: "Ready-to-ship welcome kits for new hires, events, colleges and teams.",
    items: [
      // Only Classic Welcome Kit remains — themed variants.
      ...makeSubs("corporate-welcome-kit", corporate, undefined, [
        { name: "Classic Welcome Kit", image: classicWelcomeKit },
      ], 1).map((s) => {
        const themed = ["Employee Welcome Kit", "Conference Welcome Kit", "College Welcome Kit", "Team Welcome Kit"];
        s.products = themed.map((n) => {
          __id++;
          __ts += 1000;
          return {
            id: `c${__id}`,
            name: n,
            categorySlug: "corporate-welcome-kit",
            subSlug: s.slug,
            tier: undefined,
            fabric: "Kit",
            gsm: "Kit",
            moq: 20,
            price: `₹0`,
            image: corporate,
            gallery: [corporate, corporate, corporate, corporate],
            colors: DEFAULT_COLORS,
            description: `${n} — build your own welcome kit. T-Shirt is mandatory; pick at least two more add-ons. Price is calculated from individual item prices.`,
            material: "Curated bundle",
            isNew: true,
            addedAt: __ts,
          } as CatalogProduct;
        });
        return s;
      }),
    ],
  },
  {
    slug: "arrheniux-t-shirts",
    name: "ARRHENIUX T-Shirts",
    image: tshirts,
    hasTiers: false,
    blurb: "Our in-house premium line — branded, finished, fully ready.",
    items: makeSubs("arrheniux-t-shirts", tshirts, "premium", [
      "ARRHENIUX Cotton Round Neck T-Shirt",
      "ARRHENIUX Cotton Collar Neck T-Shirt",
      "ARRHENIUX Blend Collar Neck T-Shirt",
      "ARRHENIUX Dryfit Collar Neck T-Shirt",
      "ARRHENIUX Oversized T-Shirt",
      "ARRHENIUX Hoodie",
      "ARRHENIUX Polo T-Shirt",
    ], 2),
  },
];

// ---------- Helpers ----------
export const findCategory = (slug?: string) =>
  catalog.find((c) => c.slug === slug);

export const getSubsForTier = (cat: CatalogCategory, tier?: string): Subcategory[] => {
  if (!cat.hasTiers) return cat.items ?? [];
  if (tier === "regular") return cat.regular ?? [];
  if (tier === "premium") return cat.premium ?? [];
  return [];
};

export const findSubcategory = (cat: CatalogCategory, tier: string | undefined, subSlug?: string) => {
  const subs = cat.hasTiers ? getSubsForTier(cat, tier) : cat.items ?? [];
  return subs.find((s) => s.slug === subSlug);
};

export const allProducts = (): CatalogProduct[] =>
  catalog.flatMap((c) =>
    c.hasTiers
      ? [...(c.regular ?? []), ...(c.premium ?? [])].flatMap((s) => s.products)
      : (c.items ?? []).flatMap((s) => s.products)
  );

export const findProduct = (id?: string): CatalogProduct | undefined =>
  allProducts().find((p) => p.id === id);

export const latestProducts = (n = 9): CatalogProduct[] =>
  allProducts()
    .slice()
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, n);

export const productHref = (p: CatalogProduct) => `/product/${p.id}`;

export const listingHref = (catSlug: string, tier: string | undefined, subSlug: string) =>
  `/category/${catSlug}/${tier ?? "_"}/${subSlug}`;

// ---------- Garment vs non-garment ----------
const NON_GARMENT = new Set(["custom-accessories", "corporate-welcome-kit"]);
export const isNonGarmentCategory = (slug: string) => NON_GARMENT.has(slug);
export const isArrheniuxCategory = (slug: string) => slug === "arrheniux-t-shirts";
export const isWelcomeKitCategory = (slug: string) => slug === "corporate-welcome-kit";
export const isSchoolUniformCategory = (slug: string) => slug === "customize-school-uniform";

// Size sets ---------------------------------------------------------
export const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export const SCHOOL_UNIFORM_SIZES = ["22", "24", "26", "28", "30", "32", "34"] as const;
export const getSizesFor = (catSlug: string): readonly string[] =>
  isSchoolUniformCategory(catSlug) ? SCHOOL_UNIFORM_SIZES : APPAREL_SIZES;
export const emptySizes = (catSlug: string): Record<string, number> =>
  Object.fromEntries(getSizesFor(catSlug).map((s) => [s, 0]));

// Print type is offered on everything EXCEPT non-garment items and the ARRHENIUX line.
export const supportsPrint = (catSlug: string) =>
  !isNonGarmentCategory(catSlug) && !isArrheniuxCategory(catSlug);

// ---------- Pricing helpers ----------
export const priceValue = (p: Pick<CatalogProduct, "price">) =>
  Number(String(p.price).replace(/[^\d.]/g, "")) || 0;

// Per-piece courier
export const COURIER_PER_PC = 30;
export const GST_RATE = 0.05; // default 5% 
export const BULK_DISCOUNT_PCT = 40;
export const BULK_THRESHOLD = 80;
export const B2B_MOQ = 14;
export const B2B_STEP = 2;
export const ARR_SIZE_MAX = 3; // ARRHENIUX per-size cap

// Per-product MOQ: ARRHENIUX = 1, Custom Premium Polo = 50, accessories per rule, else 5
export const getMOQ = (p: Pick<CatalogProduct, "categorySlug" | "subSlug">) => {
  if (isArrheniuxCategory(p.categorySlug)) return 1;
  if (p.categorySlug === "custom-fabric-t-shirts") return 50;
  const rule = getAccessoryRules(p.subSlug);
  if (rule) return rule.moq;
  return 5;
};

export const getMaxQty = (p: Pick<CatalogProduct, "categorySlug" | "subSlug">) => {
  if (isArrheniuxCategory(p.categorySlug)) return ARR_SIZE_MAX;
  const rule = getAccessoryRules(p.subSlug);
  if (rule) return rule.max;
  return BULK_THRESHOLD;
};

// Retail-tier % discount (below bulk threshold)
export const getDiscountPct = (qty: number, p?: Pick<CatalogProduct, "subSlug">) => {
  if (p) {
    const rule = getAccessoryRules(p.subSlug);
    if (rule && !rule.discountEnabled) return 0;
  }
  if (qty >= 50) return 30;
  if (qty >= 25) return 20;
  if (qty >= 10) return 10;
  return 0;
};

// Human-friendly product code
export const productCode = (p: Pick<CatalogProduct, "id" | "code" | "categorySlug">) => {
  if (p.code) return p.code;
  const catInitials = p.categorySlug.split("-").map((w) => w[0]?.toUpperCase() || "").join("").slice(0, 3);
  return `ARR-${catInitials}-${p.id.toUpperCase()}`;
};

// ---------- Accessory / non-garment per-product rules ----------
export type AccessoryRule = {
  moq: number;
  max: number;
  gstPct: number; // 5 or 18
  discountEnabled: boolean;
  oem?: boolean;
  courierPerPc?: number; // override; accessories default to 0
  // Print config: which method(s) allowed, which option ids under each, or FREE-only note
  print:
    | { kind: "none" }
    | { kind: "free"; label: string }
    | { kind: "custom"; methods: Array<{ id: "embroidery" | "dtf" | "sublimation" | "laser" | "digital"; label?: string; options: { id: string; label: string; pricePerPc: number }[] }> };
  note?: string;
  // Named colour choices displayed as a select (Cap, Umbrella, Lanyard)
  namedColors?: string[];
  // Additional named "print colour" choice (Event Lanyard)
  printColors?: string[];
};

const ACCESSORY_RULES: Record<string, AccessoryRule> = {
  "canvas-tote": {
    moq: 5, max: 80, gstPct: 5, discountEnabled: false, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "dtf", label: "DTF Print", options: [
      { id: "tote-logo", label: "Company Logo (3×2 inch)", pricePerPc: 20 },
      { id: "tote-a4", label: "A4 Print", pricePerPc: 40 },
      { id: "tote-company-name", label: "Company Name Design (8×2 inch)", pricePerPc: 30 },
    ]}]},
  },
  "safety-goggle": {
    moq: 50, max: 80, gstPct: 18, discountEnabled: false, oem: true, courierPerPc: 0,
    print: { kind: "none" },
  },
  "premium-backpack": {
    moq: 50, max: 80, gstPct: 18, discountEnabled: false, oem: true, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "dtf", label: "DTF Print", options: [
      { id: "bp-logo", label: "Company Logo (3×2 inch)", pricePerPc: 20 },
    ]}]},
  },
  "pen": {
  moq: 50, max: 80, gstPct: 18, discountEnabled: false, oem: true, courierPerPc: 0,
  print: { kind: "custom", methods: [
    { id: "laser", label: "Laser Print", options: [{ id: "pen-laser-logo", label: "Company Logo", pricePerPc: 20 }] },
    { id: "sublimation", label: "Sublimation Print", options: [{ id: "pen-sub-logo", label: "Company Logo", pricePerPc: 20 }] },
  ]},
},
  "badge": {
    moq: 50, max: 80, gstPct: 18, discountEnabled: false, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "digital", label: "Digital Print", options: [
      { id: "badge-logo", label: "Company Logo", pricePerPc: 80 },
    ]}]},
    note: "Fastener Type: Pin",
  },
  "mug": {
    moq: 50, max: 80, gstPct: 18, discountEnabled: false, oem: true, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "sublimation", label: "Sublimation Print", options: [
      { id: "mug-logo", label: "Company Logo", pricePerPc: 20 },
      { id: "mug-team", label: "Team Photo", pricePerPc: 50 },
    ]}]},
    note: "Available Color: White only.",
  },
  "cap": {
    moq: 50, max: 80, gstPct: 5, discountEnabled: false, oem: true, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "dtf", label: "DTF Print", options: [
      { id: "cap-logo", label: "Company Logo", pricePerPc: 20 },
    ]}]},
  },
  "umbrella": {
    moq: 50, max: 80, gstPct: 5, discountEnabled: false, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "dtf", label: "DTF Print", options: [
      { id: "umb-logo", label: "Company Logo", pricePerPc: 10 },
    ]}]},
  },
  "event-lanyard": {
    moq: 50, max: 80, gstPct: 5, discountEnabled: false, courierPerPc: 0,
    print: { kind: "custom", methods: [{ id: "sublimation", label: "Sublimation Print", options: [
      { id: "lan-logo", label: "Company Logo", pricePerPc: 20 },
    ]}]},
    // namedColors: ["Black", "White", "Red", "Royal Blue", "Multicolor"],
    printColors: ["White", "Black"],
  },
};

// Print options shared by all Customize School Uniform subcategories.
const SCHOOL_UNIFORM_PRINT_METHODS = [
  { id: "dtf" as const, label: "DTF Print", options: [
    { id: "su-dtf-chest", label: "DTF Chest Logo", pricePerPc: 15 },
    { id: "su-dtf-back", label: "Back Name Print", pricePerPc: 20 },
  ]},
  { id: "sublimation" as const, label: "Sublimation Print", options: [
    { id: "su-sub-woven", label: "Woven Chest Logo", pricePerPc: 20 },
    { id: "su-sub-back", label: "Back Name Print", pricePerPc: 20 },
  ]},
  { id: "embroidery" as const, label: "Embroidery Print", options: [
    { id: "su-emb-chest", label: "Embroidery Chest Logo", pricePerPc: 20 },
  ]},
];
["spun-matty-220-gsm", "pc-matty-220-gsm", "track-pant-spun-poly-polyester", "track-pant-cotton-pc-loop-knit"].forEach((slug) => {
  ACCESSORY_RULES[slug] = {
    moq: 50, max: 80, gstPct: 5, discountEnabled: true,
    print: { kind: "custom", methods: SCHOOL_UNIFORM_PRINT_METHODS },
  };
});

export const getAccessoryRules = (subSlug?: string): AccessoryRule | null => {
  if (!subSlug) return null;
  return ACCESSORY_RULES[subSlug] ?? null;
};

// GST% for a product (5% default, some accessories 18%)
export const getGstPct = (p: Pick<CatalogProduct, "subSlug">) => {
  const rule = getAccessoryRules(p.subSlug);
  return rule ? rule.gstPct / 100 : GST_RATE;
};

// Courier per piece — FREE across the site.
export const getCourierPerPc = (_p: Pick<CatalogProduct, "categorySlug" | "subSlug">) => 0;

// Sample price = 1 pc at unit price + courier + GST (a small stand-alone charge)
export const samplePrice = (p: CatalogProduct) => {
  const unit = priceValue(p);
  const courier = getCourierPerPc(p);
  const gst = Math.round((unit + courier) * getGstPct(p));
  return unit + courier + gst;
};

// ---------- Welcome Kit config ----------
export const WELCOME_KIT_MIN = 20;
export const WELCOME_KIT_ITEMS = [
  { id: "tshirt", label: "T-Shirt", price: 200, required: true },
  { id: "mug", label: "Mug", price: 100 },
  { id: "pen", label: "Pen", price: 50 },
  { id: "notebook", label: "Notebook", price: 30 },
  { id: "bottle", label: "Bottle", price: 80 },
  { id: "backpack", label: "Backpack", price: 150 },
] as const;
// Mandatory T-Shirt + at least 2 more selections (spec: at least 2 additional).
export const WELCOME_KIT_MIN_ITEMS = 3;
export const welcomeKitUnitPrice = (selectedIds: string[]): number =>
  selectedIds.reduce((sum, id) => sum + (WELCOME_KIT_ITEMS.find((k) => k.id === id)?.price ?? 0), 0);

// ---------- B2B curated subcategories ----------
export type B2BSub = {
  slug: string;
  name: string;
  catSlug: string;
  tier?: Tier;
};
export const B2B_SUBCATEGORIES: B2BSub[] = [
  { slug: "oversized-tshirt", name: "Oversized T-Shirt", catSlug: "oversized-t-shirts", tier: "premium" },
  { slug: "dryfit-collar", name: "Dry Fit Collar Neck T-Shirt", catSlug: "corporate-wear", tier: "premium" },
  { slug: "american-fleece", name: "American Fleece Hoodies", catSlug: "hoodies", tier: "premium" },
  { slug: "solid-collar", name: "Solid Collar Neck T-Shirt", catSlug: "corporate-wear", tier: "regular" },
  { slug: "dryfit-solid-collar", name: "Dry Fit Solid Collar Neck T-Shirt", catSlug: "corporate-wear", tier: "premium" },
  { slug: "round-neck", name: "Round Neck T-Shirt", catSlug: "custom-round-neck-t-shirts", tier: "regular" },
];

export const getB2BProducts = (b2bSlug: string): CatalogProduct[] => {
  const b = B2B_SUBCATEGORIES.find((x) => x.slug === b2bSlug);
  if (!b) return [];
  const cat = findCategory(b.catSlug);
  if (!cat) return [];
  const subs = cat.hasTiers ? (b.tier === "regular" ? cat.regular : cat.premium) ?? [] : cat.items ?? [];
  const sub = subs.find((s) => s.name === b.name) || subs[0];
  return sub?.products ?? [];
};

// Valid B2B agent codes (demo). Replace with backend validation later.
export const B2B_AGENT_CODES = ["AGENT2024", "ARR-B2B", "DEALER100"];

// Legacy print type placeholder
export type PrintType = { id: string; label: string; pricePerPc: number };
export const PRINT_TYPES: PrintType[] = [{ id: "none", label: "No Print", pricePerPc: 0 }];
export const findPrintType = (_id: string): PrintType => PRINT_TYPES[0];
