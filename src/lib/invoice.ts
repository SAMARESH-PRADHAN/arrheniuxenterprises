// import jsPDF from "jspdf";
// import type { StorefrontOrder } from "./orderMappers";

// export type InvoiceOrder = StorefrontOrder & {
//   customer?: Record<string, string>;
//   paymentRef?: string;
//   printCharge?: number;
// };

// const BRAND = "ARRHENIUX";
// const ADDRESS = "Niladri Vihar, Bhubaneswar, Odisha 751021";
// const EMAIL = "banamali08@gmail.com.com";
// const PHONE = "+91 99378 64993";

// export const downloadInvoice = (order: InvoiceOrder) => {
//   const doc = new jsPDF({ unit: "pt", format: "a4" });
//   const w = doc.internal.pageSize.getWidth();
//   let y = 40;

//   // Header
//   doc.setFontSize(24);
//   doc.setFont("helvetica", "bold");
//   doc.text(BRAND, 40, y);
//   doc.setFontSize(9);
//   doc.setFont("helvetica", "normal");
//   doc.text(ADDRESS, 40, y + 14);
//   doc.text(`${EMAIL} · ${PHONE}`, 40, y + 26);

//   doc.setFontSize(20);
//   doc.setFont("helvetica", "bold");
//   doc.text("INVOICE", w - 40, y, { align: "right" });
//   doc.setFontSize(9);
//   doc.setFont("helvetica", "normal");
//   doc.text(`Invoice #: ARR-${order.id.slice(0, 8).toUpperCase()}`, w - 40, y + 14, { align: "right" });
//   doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, w - 40, y + 26, { align: "right" });
//   const expected = new Date(new Date(order.createdAt).getTime() + 10 * 86400000);
//   doc.text(`Expected Delivery: ${expected.toLocaleDateString()}`, w - 40, y + 38, { align: "right" });

//   y += 70;
//   doc.setDrawColor(200, 200, 200);
//   doc.line(40, y, w - 40, y);

//   y += 20;
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("BILL TO", 40, y);
//   y += 14;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   const cust = order.customer || {};
//   const lines = [
//     cust.fullName || "Customer",
//     cust.company || "",
//     cust.email || "",
//     cust.phone || "",
//     [cust.address, cust.city, cust.state, cust.pincode].filter(Boolean).join(", "),
//   ].filter(Boolean);
//   lines.forEach((l) => { doc.text(String(l), 40, y); y += 12; });

//   y += 20;
//   // Line item table
//   doc.setFillColor(20, 20, 20);
//   doc.rect(40, y, w - 80, 22, "F");
//   doc.setTextColor(255, 255, 255);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.text("PRODUCT", 48, y + 14);
//   doc.text("QTY", w - 220, y + 14);
//   doc.text("UNIT", w - 160, y + 14);
//   doc.text("AMOUNT", w - 48, y + 14, { align: "right" });
//   y += 30;
//   doc.setTextColor(20, 20, 20);
//   doc.setFont("helvetica", "normal");
//   doc.text(`${order.productName}`, 48, y);
//   if (order.productCode) doc.text(`Code: ${order.productCode}`, 48, y + 12);
//   doc.text(String(order.qty), w - 220, y);
//   doc.text(`Rs ${order.unitPrice}`, w - 160, y);
//   doc.text(`Rs ${(order.unitPrice * order.qty).toLocaleString("en-IN")}`, w - 48, y, { align: "right" });
//   y += 30;

//   doc.setDrawColor(220, 220, 220);
//   doc.line(40, y, w - 40, y);
//   y += 16;

//   const addRow = (label: string, value: string, bold = false) => {
//     doc.setFont("helvetica", bold ? "bold" : "normal");
//     doc.setFontSize(bold ? 11 : 9);
//     doc.text(label, w - 200, y);
//     doc.text(value, w - 48, y, { align: "right" });
//     y += bold ? 18 : 14;
//   };

//   addRow("Subtotal", `₹${order.subtotal.toLocaleString("en-IN")}`);
//   if (order.printCharge && order.printCharge > 0)
//     addRow(`Printing (${order.printType || "Print"})`, `₹${order.printCharge.toLocaleString("en-IN")}`);
//   if (order.discountAmt > 0)
//     addRow(`Discount (${order.discountPct}%)`, `−₹${order.discountAmt.toLocaleString("en-IN")}`);
//   addRow("Courier", `₹${order.courier.toLocaleString("en-IN")}`);
//   addRow("GST (5%)", `₹${order.gst.toLocaleString("en-IN")}`);
//   y += 4;
//   doc.setDrawColor(20, 20, 20);
//   doc.line(w - 220, y, w - 40, y);
//   y += 14;
//   addRow("Total", `₹${order.total.toLocaleString("en-IN")}`, true);
//   addRow("Paid", `₹${order.paid.toLocaleString("en-IN")}`);
//   const due = Math.max(0, order.total - order.paid);
//   addRow("Balance", due === 0 ? "PAID" : `₹${due.toLocaleString("en-IN")}`, due > 0);

//   y += 20;
//   doc.setFontSize(9);
//   doc.setFont("helvetica", "italic");
//   doc.setTextColor(120, 120, 120);
//   doc.text("Thank you for your order.", 40, y);
//   doc.text(`Payment Status: ${due === 0 ? "PAID" : "PENDING BALANCE"} · Ref: ${order.paymentRef || "—"}`, 40, y + 12);

//   doc.save(`invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
// };



import jsPDF from "jspdf";
import type { StorefrontOrder } from "./orderMappers";
import logoUrl from "@/assets/arrhenius-logo.png";
import { ADDRESS, EMAIL, WHATSAPP_DISPLAY } from "@/data/site";

export type InvoiceOrder = StorefrontOrder & {
  customer?: Record<string, string>;
  paymentRef?: string;
  printCharge?: number;
};

// ---------------------------------------------------------------------------
// Brand palette (matches the storefront's CSS design tokens)
// ---------------------------------------------------------------------------
const INK: [number, number, number] = [17, 17, 17];
const PRIMARY: [number, number, number] = [26, 90, 56]; // deep green
const ACCENT: [number, number, number] = [201, 122, 74]; // burnt orange
const CREAM: [number, number, number] = [250, 247, 240];
const GRAY_LIGHT: [number, number, number] = [244, 244, 242];
const GRAY_LINE: [number, number, number] = [222, 220, 214];
const GRAY_TEXT: [number, number, number] = [110, 110, 108];
const RED: [number, number, number] = [190, 45, 45];
const GREEN_OK: [number, number, number] = [26, 122, 66];
const AMBER: [number, number, number] = [176, 120, 20];

const COMPANY = {
  name: "ARRHENIUX",
  legal: "Arrheniux Enterprises",
  tagline: "Factory-Direct Custom Apparel",
  address: ADDRESS,
  email: EMAIL,
  phone: WHATSAPP_DISPLAY,
};

const fmt = (n: number) => `Rs ${Math.round(n).toLocaleString("en-IN")}`;

const KIND_LABEL: Record<string, string> = {
  retail: "Retail Order",
  bulk: "Bulk Order",
  b2b: "B2B Order",
};

const PAYMENT_LABEL: Record<string, string> = {
  full: "Full Payment",
  "advance-50": "50% Advance",
  cod: "Cash on Delivery",
};

// ---------------------------------------------------------------------------
// Image helpers — convert the bundled logo into a data URL jsPDF can embed
// ---------------------------------------------------------------------------
function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

let cachedLogoData: { dataUrl: string; ratio: number } | null = null;

async function getLogoData(): Promise<{ dataUrl: string; ratio: number } | null> {
  if (cachedLogoData) return cachedLogoData;
  try {
    const img = await loadImageEl(logoUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 300;
    canvas.height = img.naturalHeight || 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    cachedLogoData = { dataUrl: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
    return cachedLogoData;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export const downloadInvoice = async (order: InvoiceOrder) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14; // page margin
  const contentW = W - M * 2;

  const invoiceNo = `ARR-${order.id.toUpperCase()}`;
  const orderDate = new Date(order.createdAt);
  const expected = order.expectedDelivery
    ? new Date(order.expectedDelivery)
    : new Date(orderDate.getTime() + 10 * 86400000);
  const due = Math.max(0, order.total - order.paid);
  const cust = order.customer || {};

  doc.setProperties({ title: `Invoice ${invoiceNo}`, creator: COMPANY.name });

  const logo = await getLogoData();

  // ---- Watermark (drawn first, sits behind everything) -------------------
  if (logo) {
    const size = 130;
    const gsLight = new (doc as unknown as { GState: new (o: object) => unknown }).GState({ opacity: 0.05 });
    (doc as unknown as { setGState: (g: unknown) => void }).setGState(gsLight);
    doc.addImage(logo.dataUrl, "PNG", W / 2 - size / 2, H / 2 - size / 2, size, size);
    const gsFull = new (doc as unknown as { GState: new (o: object) => unknown }).GState({ opacity: 1 });
    (doc as unknown as { setGState: (g: unknown) => void }).setGState(gsFull);
  }

  // ---- Header --------------------------------------------------------------
  let y = 16;
  if (logo) {
    const boxH = 20;
    const boxW = boxH * logo.ratio;
    doc.addImage(logo.dataUrl, "PNG", M, y - 4, Math.min(boxW, 24), boxH);
  }
  const textX = M + 28;
  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(COMPANY.name, textX, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(COMPANY.tagline, textX, y + 7.5);
  doc.text(COMPANY.address, textX, y + 12);
  doc.text(`${COMPANY.email}  |  ${COMPANY.phone}`, textX, y + 16.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text("TAX INVOICE", W - M, y + 2, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`Invoice #: ${invoiceNo}`, W - M, y + 8, { align: "right" });
  doc.text(`Invoice Date: ${orderDate.toLocaleDateString("en-IN")}`, W - M, y + 12.5, { align: "right" });
  // doc.text(`Expected Delivery: ${expected.toLocaleDateString("en-IN")}`, W - M, y + 17, { align: "right" });

  // Status badge
  const paymentOk = due === 0;
  const badgeColor = paymentOk ? GREEN_OK : order.paid > 0 ? AMBER : RED;
  const badgeText = paymentOk ? "PAID IN FULL" : order.paid > 0 ? "PARTIALLY PAID" : "PAYMENT PENDING";
  doc.setFillColor(...badgeColor);
  const badgeW = doc.getTextWidth(badgeText) + 8;
  doc.roundedRect(W - M - badgeW, y + 20, badgeW, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(badgeText, W - M - badgeW / 2, y + 24.5, { align: "center" });

  y += 34;
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(1);
  doc.line(M, y, W - M, y);
  y += 8;

  // ---- Bill From / Bill To ---------------------------------------------
  const colW = (contentW - 6) / 2;
  const boxH = 34;

  const drawInfoBox = (
    x: number,
    label: string,
    lines: string[],
  ) => {
    doc.setFillColor(...GRAY_LIGHT);
    doc.roundedRect(x, y, colW, boxH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(label, x + 5, y + 6);
    doc.setTextColor(...INK);
    let ly = y + 12;
    lines.forEach((line, i) => {
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      doc.setFontSize(i === 0 ? 10.5 : 8.5);
      if (!line) return;
      const wrapped = doc.splitTextToSize(line, colW - 10);
      wrapped.forEach((wl: string) => {
        doc.text(wl, x + 5, ly);
        ly += i === 0 ? 5.5 : 4.2;
      });
    });
  };

  drawInfoBox(M, "BILLED FROM", [
    COMPANY.legal,
    COMPANY.address,
    `Email: ${COMPANY.email}`,
    `Phone: ${COMPANY.phone}`,
  ]);

  const billToLines = [
    cust.fullName || order.customerName || "Customer",
    cust.company || "",
    (cust.phone || order.phone) ? `Phone: ${cust.phone || order.phone}` : "",
    (cust.email || order.email) ? `Email: ${cust.email || order.email}` : "",
    cust.address
      ? [cust.address, cust.city, cust.state, cust.pincode].filter(Boolean).join(", ")
      : order.address || "",
  ].filter(Boolean);

  drawInfoBox(M + colW + 6, "BILLED TO", billToLines);
  y += boxH + 8;

  // ---- Order meta strip ---------------------------------------------------
  const isDelivered = order.status === "Delivered";
const deliveryDateLabel = isDelivered ? "DELIVERED ON" : "EXPECTED DELIVERY";
const deliveryDateValue = isDelivered && order.deliveredAt
  ? new Date(order.deliveredAt).toLocaleDateString("en-IN")
  : expected.toLocaleDateString("en-IN");
  const metaItems = [
    { label: "ORDER ID", value: order.id.toUpperCase() },
    { label: "ORDER TYPE", value: KIND_LABEL[order.kind] || order.kind.toUpperCase() },
    { label: "PAYMENT MODE", value: PAYMENT_LABEL[order.paymentMode] || order.paymentMode },
    { label: "DELIVERY STATUS", value: order.status },
     { label: deliveryDateLabel, value: deliveryDateValue },
  ];
  const metaW = contentW / metaItems.length;
  metaItems.forEach((m, i) => {
    const x = M + i * metaW;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(m.label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(String(m.value), x, y + 5);
    if (i < metaItems.length - 1) {
      doc.setDrawColor(...GRAY_LINE);
      doc.setLineWidth(0.2);
      doc.line(x + metaW - 4, y - 3, x + metaW - 4, y + 6);
    }
  });
  y += 12;
  doc.setDrawColor(...GRAY_LINE);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 8;

  // ---- Items table ----------------------------------------------------------
  const col = { desc: M, qty: M + 108, price: M + 128, amount: M + 156 };
  const tableRight = W - M;

  doc.setFillColor(...PRIMARY);
  doc.rect(M, y, contentW, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("ITEM & DESCRIPTION", col.desc + 3, y + 5.3);
  doc.text("QTY", col.qty, y + 5.3, { align: "center" });
  doc.text("UNIT PRICE", col.price + 12, y + 5.3, { align: "right" });
  doc.text("AMOUNT", tableRight - 3, y + 5.3, { align: "right" });
  y += 8;

  const sizesLine = Object.entries(order.sizes || {})
    .filter(([, v]) => v > 0)
    .map(([s, v]) => `${s}×${v}`)
    .join("  ·  ");

  const detailLines: string[] = [];
  if (order.productCode) detailLines.push(`Code: ${order.productCode}`);
  if (order.description && order.description.toLowerCase().includes("kit items"))
  detailLines.push(order.description.replace(/₹/g, "Rs "));
  if (order.category) detailLines.push(`Category: ${order.category}${order.subCategory ? ` — ${order.subCategory}` : ""}`);
  if (order.material) detailLines.push(`Material: ${order.material}`);
  if (order.printType && order.printType !== "N/A") detailLines.push(`Print: ${order.printType}`);
  if (sizesLine) detailLines.push(`Sizes: ${sizesLine}`);
  

  const wrappedDetails = detailLines.flatMap((l) => doc.splitTextToSize(l, 100));
  const rowH = Math.max(16, 8 + wrappedDetails.length * 4.2);

  doc.setDrawColor(...GRAY_LINE);
  doc.setLineWidth(0.2);
  doc.rect(M, y, contentW, rowH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(order.productName, col.desc + 3, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...GRAY_TEXT);
  let dy = y + 10.5;
  wrappedDetails.forEach((l: string) => {
    doc.text(l, col.desc + 3, dy);
    dy += 4.2;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(String(order.qty), col.qty, y + 6, { align: "center" });
  doc.text(fmt(order.unitPrice), col.price + 12, y + 6, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(fmt(order.unitPrice * order.qty), tableRight - 3, y + 6, { align: "right" });
  y += rowH;

  if (order.printingPrice && order.printingPrice > 0) {
    const ph = 8;
    doc.setDrawColor(...GRAY_LINE);
    doc.rect(M, y, contentW, ph, "S");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`Printing / Customization — ${order.printType || ""}`, col.desc + 3, y + 5.3);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    doc.text(fmt(order.printingPrice), tableRight - 3, y + 5.3, { align: "right" });
    y += ph;
  }
  y += 6;

  // ---- Totals summary -------------------------------------------------------
  const sumW = 82;
  const sumX = tableRight - sumW;
  const addRow = (label: string, value: string, opts: { bold?: boolean; color?: [number, number, number] } = {}) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.bold ? 10 : 9);
    doc.setTextColor(...(opts.color || INK));
    doc.text(label, sumX, y);
    doc.text(value, tableRight - 2, y, { align: "right" });
    y += opts.bold ? 6.5 : 5.5;
  };
const subtotal = order.subtotal + order.printingPrice;
const discountTotal = subtotal - order.discountAmt;
  addRow("Subtotal", fmt(order.subtotal + order.printingPrice));
  if (order.discountAmt > 0) addRow(`Discount (${order.discountPct}%)`, `- ${fmt(order.discountAmt)}`, { color: GREEN_OK });
  addRow("Total", fmt(discountTotal), {
  bold: true,
});
  addRow(order.courier > 0 ? "Courier Charges" : "Courier Charges", order.courier > 0 ? fmt(order.courier) : "FREE");
  const gstRate = order.gstPct ?? 5;
const gstAmount = (discountTotal * gstRate) / 100;

addRow(`GST (${gstRate}%)`, fmt(gstAmount));

  y += 1.5;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.3);
  doc.line(sumX, y, tableRight, y);
  y += 5;

  doc.setFillColor(...INK);
  doc.rect(sumX - 4, y - 5.5, sumW + 6, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GRAND TOTAL", sumX, y);
  doc.text(fmt(order.total), tableRight - 2, y, { align: "right" });
  y += 9;

  addRow("Amount Paid", fmt(order.paid), { color: GREEN_OK });
  if (due > 0) {
    addRow("Balance Due", fmt(due), { bold: true, color: RED });
  } else {
    addRow("Balance Due", "Rs 0 (Fully Paid)", { color: GREEN_OK });
  }
  if (order.paymentRef) addRow("Payment Ref.", order.paymentRef);

  // ---- Footer ---------------------------------------------------------------
  const footerY = H - 34;
  doc.setDrawColor(...GRAY_LINE);
  doc.setLineWidth(0.2);
  doc.line(M, footerY, W - M, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY);
  doc.text("Terms & Notes", M, footerY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(...GRAY_TEXT);
  const terms = [
    "• Customized / printed items are non-returnable unless there is a manufacturing defect.",
    "• Please report any issue within 48 hours of delivery with photos for a quick resolution.",
    "• This is a computer-generated invoice and does not require a physical signature.",
  ];
  terms.forEach((t, i) => doc.text(t, M, footerY + 11 + i * 4));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Thank you for choosing Arrheniux Enterprises", W - M, footerY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`${COMPANY.phone}  •  ${COMPANY.email}`, W - M, footerY + 11, { align: "right" });
  doc.text("Bhubaneswar, Odisha, India", W - M, footerY + 15, { align: "right" });

  doc.setFontSize(7);
  doc.setTextColor(...GRAY_LINE);
  doc.text("Page 1 of 1", W / 2, H - 8, { align: "center" });

  doc.save(`invoice-${order.id.toUpperCase()}.pdf`);
};