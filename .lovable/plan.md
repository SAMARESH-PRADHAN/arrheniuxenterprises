Large scoped update — implementing across catalog, checkout flows, B2B, profile, and UI polish. Existing design, spacing, typography untouched.

## 1. Customize School Uniform (new category)

`src/data/catalog.ts`
- Insert new category right after `aprons`: slug `customize-school-uniform`, name "Customize School Uniform", `hasTiers: false`.
- Subcategories (`items`):
  1. Spun Matty 220 GSM
  2. PC Matty 220 GSM
  3. Track Pant Spun Poly Polyester
  4. Track Pant Cotton PC Loop Knit
- Each subcategory shows a small product list (3 styles via `makeSubs`).
- MOQ rules:
  - `getMOQ`: category returns 50 (categories flow)
  - `BulkOrder` page enforces 80 min for this category
- Treated as garment (size selection, courier already handled).

## 2. Print Type — School Uniform only

New rule in `catalog.ts` `SCHOOL_UNIFORM_PRINT` (kept separate from accessory rules to avoid conflicts):
- Method dropdown: DTF / Sublimation / Embroidery
- DTF options: Chest Logo ₹15, Back Name Print ₹20 (checkboxes)
- Sublimation options: Woven Chest Logo ₹20, Back Name Print ₹20
- Embroidery options: Chest Logo ₹20

Extend `PrintPicker` to accept a `singleMethod` prop OR reuse the existing custom-methods pathway with a "method dropdown" UI variant. Simplest: pass full custom `methods` array and let user tick options; keep existing UI. Charges auto-summed as today.

## 3. Sample Product button

- School Uniform PDPs get "Order Sample Product" using existing `SampleDialog` (already handles size + print + upload + billing + Razorpay + order history + WhatsApp). Just make sure category qualifies (`isGarment` true). No new code needed beyond category registration.

## 4. Remove Color Selection everywhere

Files: `src/pages/ProductDetail.tsx`, `src/components/SampleDialog.tsx`, `src/pages/BulkOrder.tsx`, `src/pages/B2BShop.tsx`.
- Suppress the generic color swatch block when there are no `namedColors` in the accessory rule.
- Keep named color selectors for Cap, Umbrella, Lanyard, etc. (rule-driven, unchanged).
- Remove `color` line from WhatsApp summary when not applicable.

## 5. Courier — display FREE, do not add

Global: change billing UI to always show `Courier Charges: FREE`.
- `getCourierPerPc` → return 0 everywhere (safest single-point change).
- Update all pages that show the courier row: PDP, Sample, Bulk, B2B, invoice.
- Retain the total formula (no courier component now).

## 6. B2B Verification revamp

`src/pages/B2BShop.tsx`
- Always start in "unverified" state on mount (do not read from storage). Gate persists only for the session's active tab lifetime (in-memory React state) → guarantees popup on every fresh window/open.
- Remove GST-number input; keep only Marketing Agent Code.
- Step 2 (new): Agent Registration Form — Company Name, Contact Person, Mobile, Email, GST Number, Address, City, State, Pincode. All required.
- On submit → save to `localStorage` (`arr_b2b_agents`) keyed by code + timestamp, and set component state to unlocked.
- Verified agent can place orders without user login (B2BShop sample/order flows currently call `getSession`; bypass login check for B2B by seeding an in-memory "agent identity" used only inside B2B flow. Other sections keep login).

Add store helper in `authStore.ts`: `saveAgentRegistration`, `getAgentRegistrations`.

## 7. My Address management

New page `src/pages/MyAddresses.tsx` + link from `UserMenu` and `MyOrders` sidebar.

Address type:
```ts
{ id, name, line1, line2, landmark?, mobile, altMobile?, city, state, pincode, isDefault }
```

Store in `authStore.ts`: `getAddresses(userId)`, `saveAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`, `getDefaultAddress(userId)`.

Checkout integration:
- `ProductDetail`, `BulkOrder`, `SampleDialog`: before Razorpay pay, if user has ≥1 address, use default; allow selecting from list via inline `<select>`. If none, prompt to add (link to `/my-addresses?return=<path>`).
- Include address in `Order.customer` and WhatsApp summary block "Delivery Address".

Route registered in `src/App.tsx`.

## 8. Animations / graphics polish

`src/index.css` — add utility classes: `.animate-float`, `.hover-lift`, `.img-zoom` (already have fade/scale). No structural changes.
- Apply `.hover-lift` to product cards, `.img-zoom` wrapper on PDP hero image.
- Dropdown menus already animated (Radix). Confirm `animate-fade-in` on modals.

Skipping heavy new illustration assets to keep the design as-is; adding only CSS-level polish.

## Technical details

- Routes: `App.tsx` already handles `/category/:slug` etc. dynamically via catalog — new category picks up automatically. Add explicit `/my-addresses` route.
- No schema/backend changes (localStorage store).
- Typecheck after each large edit.

## Files touched

- src/data/catalog.ts
- src/components/PrintPicker.tsx (minor — support single-method dropdown label)
- src/components/SampleDialog.tsx
- src/pages/ProductDetail.tsx
- src/pages/BulkOrder.tsx
- src/pages/B2BShop.tsx
- src/pages/MyAddresses.tsx (new)
- src/components/UserMenu.tsx
- src/lib/authStore.ts
- src/lib/invoice.ts (courier line label)
- src/App.tsx
- src/index.css
