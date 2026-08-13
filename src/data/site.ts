import tshirts from "@/assets/cat-tshirts.jpg";
import hoodies from "@/assets/cat-hoodies.jpg";
import polos from "@/assets/cat-polos.jpg";
import sweatshirts from "@/assets/cat-sweatshirts.jpg";
import jeans from "@/assets/cat-jeans.jpg";
import joggers from "@/assets/cat-joggers.jpg";
import caps from "@/assets/cat-caps.jpg";
import shorts from "@/assets/cat-shorts.jpg";
import jackets from "@/assets/cat-jackets.jpg";
import totes from "@/assets/cat-totes.jpg";
import uniforms from "@/assets/cat-uniforms.jpg";
import corporate from "@/assets/cat-corporate.jpg";

export const WHATSAPP_NUMBER = "919937864993";
export const WHATSAPP_DISPLAY = "+91 99378 64993";
export const EMAIL = "banamali08@gmail.com";
export const ADDRESS = "Odisha, India 751021";
export const MAPS_URL = "https://maps.app.goo.gl/oh4CuRvus1gfH4D49";

export const waLink = (msg = "Hi Arrheniux, I'd like to enquire about your custom apparel.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export type Category = {
  slug: string;
  name: string;
  image: string;
  fabric: string;
};

export const categories: Category[] = [
  { slug: "t-shirts", name: "T-Shirts", image: tshirts, fabric: "180–240 GSM Cotton" },
  { slug: "hoodies", name: "Hoodies", image: hoodies, fabric: "320 GSM Fleece" },
  { slug: "polos", name: "Polo Shirts", image: polos, fabric: "Pique Cotton" },
  { slug: "sweatshirts", name: "Sweatshirts", image: sweatshirts, fabric: "280 GSM Fleece" },
  { slug: "jeans", name: "Jeans", image: jeans, fabric: "12 oz Denim" },
  { slug: "joggers", name: "Joggers", image: joggers, fabric: "240 GSM Terry" },
  { slug: "caps", name: "Caps", image: caps, fabric: "Cotton Twill" },
  { slug: "shorts", name: "Shorts", image: shorts, fabric: "210 GSM Cotton" },
  { slug: "jackets", name: "Jackets", image: jackets, fabric: "Polyester Blend" },
  { slug: "totes", name: "Tote Bags", image: totes, fabric: "12 oz Canvas" },
  { slug: "uniforms", name: "Uniforms", image: uniforms, fabric: "Twill / Poplin" },
  { slug: "corporate", name: "Corporate Wear", image: corporate, fabric: "Premium Knit" },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  fabric: string;
  gsm: string;
  moq: number;
  price: string;
  image: string;
  colors: string[];
  isNew?: boolean;
};

export const products: Product[] = [
  { id: "p1", name: "Classic Crew Tee", category: "t-shirts", fabric: "Bio-Washed Cotton", gsm: "180 GSM", moq: 20, price: "₹220", image: tshirts, colors: ["#f5f1e8", "#1a1a1a", "#2a5d3e", "#c97a4a"], isNew: true },
  { id: "p2", name: "Heavy Drop-Shoulder Hoodie", category: "hoodies", fabric: "Premium Fleece", gsm: "320 GSM", moq: 20, price: "₹780", image: hoodies, colors: ["#f5f1e8", "#1a1a1a", "#5a6b4a"], isNew: true },
  { id: "p3", name: "Performance Polo", category: "polos", fabric: "Pique Knit", gsm: "210 GSM", moq: 20, price: "₹340", image: polos, colors: ["#bcd3e8", "#1a1a1a", "#f5f1e8"] },
  { id: "p4", name: "Oversized Sweatshirt", category: "sweatshirts", fabric: "Cotton Fleece", gsm: "280 GSM", moq: 20, price: "₹560", image: sweatshirts, colors: ["#f5f1e8", "#5a6b4a", "#c97a4a"], isNew: true },
  { id: "p5", name: "Slim Fit Denim", category: "jeans", fabric: "Stretch Denim", gsm: "12 oz", moq: 20, price: "₹890", image: jeans, colors: ["#2c3e50", "#1a1a1a"] },
  { id: "p6", name: "Cuffed Joggers", category: "joggers", fabric: "Loop Knit Terry", gsm: "240 GSM", moq: 20, price: "₹450", image: joggers, colors: ["#2a5d3e", "#1a1a1a", "#f5f1e8"] },
  { id: "p7", name: "6-Panel Baseball Cap", category: "caps", fabric: "Cotton Twill", gsm: "—", moq: 20, price: "₹180", image: caps, colors: ["#f5f1e8", "#c97a4a", "#1a1a1a", "#888"] },
  { id: "p8", name: "Linen Bermuda Shorts", category: "shorts", fabric: "Linen Cotton", gsm: "210 GSM", moq: 20, price: "₹390", image: shorts, colors: ["#f5f1e8", "#c8b89a"] },
  { id: "p9", name: "Field Jacket", category: "jackets", fabric: "Twill Poly Blend", gsm: "—", moq: 20, price: "₹1240", image: jackets, colors: ["#5a6b4a", "#1a1a1a"], isNew: true },
  { id: "p10", name: "Canvas Tote", category: "totes", fabric: "Heavy Canvas", gsm: "12 oz", moq: 20, price: "₹150", image: totes, colors: ["#f5f1e8", "#1a1a1a"] },
  { id: "p11", name: "Chef Apron", category: "uniforms", fabric: "Cotton Twill", gsm: "—", moq: 20, price: "₹290", image: uniforms, colors: ["#f5f1e8", "#1a1a1a"] },
  { id: "p12", name: "Corporate Crew Tee", category: "corporate", fabric: "Combed Cotton", gsm: "180 GSM", moq: 20, price: "₹260", image: corporate, colors: ["#1a1a1a", "#2c3e50", "#f5f1e8"] },
];

export const reviews = [
  { name: "Rahul Mishra", role: "Founder, Cubicle Co.", rating: 5, text: "Got 200 hoodies for our team. Quality, stitching, print — all on point. Delivered in 9 days." },
  { name: "Anushka Patel", role: "Event Manager, IIT BBS", rating: 5, text: "Custom event tees for 500+ students. Arrheniux nailed the brief and the colours were spot-on." },
  { name: "Prakash Reddy", role: "Owner, GreenLeaf Cafe", rating: 5, text: "Branded aprons and tees for staff. Felt premium, washed beautifully. Reordered twice." },
  { name: "Sneha Iyer", role: "HR, Coastal Logistics", rating: 5, text: "Uniform rollout across 4 branches. Clean execution, factory-direct pricing was a big win." },
  { name: "Aman Kapoor", role: "Coach, FC Bhubaneswar", rating: 5, text: "Match jerseys with sublimation print — vivid colours, breathable fabric. Team loved it." },
  { name: "Meera Joshi", role: "Brand Lead, Nuvo Beauty", rating: 5, text: "Launch merch for our pop-up. From fabric sourcing to delivery, super smooth." },
];
