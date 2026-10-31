// import { PRINT_METHODS, type PrintMethod, type PrintSelection, printPricePerPc } from "@/data/printOptions";

// type Props = {
//   value: PrintSelection;
//   onChange: (v: PrintSelection) => void;
//   qty: number;
//   // Restrict to a subset of methods (accessories often only allow 1). Defaults to all garment methods.
//   methods?: PrintMethod[];
//   // Free-only label overrides the entire picker (Pen, Badge)
//   freeLabel?: string | null;
//   // Fully disable printing (Safety Goggle)
//   disabled?: boolean;
// };

// export const PrintPicker = ({ value, onChange, qty, methods, freeLabel = null, disabled = false }: Props) => {
//   if (disabled) {
//     return (
//       <div className="mt-2">
//         <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Print Type</h4>
//         <div className="border border-border bg-secondary/40 px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-widest">
//           No print available for this product
//         </div>
//       </div>
//     );
//   }

//   if (freeLabel) {
//     return (
//       <div className="mt-2">
//         <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Printing</h4>
//         <div className="border border-border bg-secondary/40 px-3 py-2.5 text-sm flex items-center justify-between">
//           <span>{freeLabel}</span>
//           <span className="text-[10px] font-mono uppercase text-primary">Included</span>
//         </div>
//       </div>
//     );
//   }

//   const allowedMethods = methods && methods.length > 0 ? methods : PRINT_METHODS;
//   const activeMethod = value.method ? allowedMethods.find((m) => m.id === value.method) : null;

//   const setMethod = (mid: string) => {
//     if (mid === "") onChange({ method: null, options: [] });
//     else onChange({ method: mid as PrintSelection["method"], options: [] });
//   };

//   const toggleOption = (oid: string) => {
//     if (!value.options.includes(oid)) {
//       onChange({ ...value, options: [...value.options, oid] });
//     } else {
//       onChange({ ...value, options: value.options.filter((x) => x !== oid) });
//     }
//   };

//   const perPc = printPricePerPc(value, allowedMethods);
//   const totalCharge = perPc * qty;

//   return (
//     <div className="mt-2">
//       <h4 className="text-xs uppercase tracking-widest font-bold mb-2">Print Type</h4>
//       <select
//         value={value.method ?? ""}
//         onChange={(e) => setMethod(e.target.value)}
//         className="w-full border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-ink"
//       >
//         <option value="">No Print</option>
//         {allowedMethods.map((m) => (
//           <option key={m.id} value={m.id}>{m.label}</option>
//         ))}
//       </select>

//       {activeMethod && (
//         <div className="mt-3 border border-border bg-secondary/40 p-3 space-y-1.5">
//           {activeMethod.note && (
//             <p className="text-[11px] text-muted-foreground italic mb-1">{activeMethod.note}</p>
//           )}
//           {activeMethod.options.map((o) => {
//             const checked = value.options.includes(o.id);
//             return (
//               <label key={o.id} className="flex items-center justify-between text-sm cursor-pointer hover:bg-cream/50 px-2 py-1.5">
//                 <span className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={checked}
//                     onChange={() => toggleOption(o.id)}
//                     className="h-4 w-4 accent-primary"
//                   />
//                   <span>{o.label}</span>
//                 </span>
//                 <span className="text-xs font-mono">
//                   {o.pricePerPc === 0 ? "FREE" : `+₹${o.pricePerPc}/pc`}
//                 </span>
//               </label>
//             );
//           })}
//           {value.options.length > 0 && (
//             <div className="flex justify-between items-center pt-2 mt-2 border-t border-border text-xs">
//               <span className="uppercase tracking-widest text-muted-foreground">Print charge</span>
//               <span className="font-bold">₹{perPc}/pc × {qty} = ₹{totalCharge}</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };


import {
  PRINT_METHODS,
  type PrintMethod,
  type PrintSelection,
  printPricePerPc,
} from "@/data/printOptions";

type Props = {
  value: PrintSelection;
  onChange: (v: PrintSelection) => void;
  qty: number;
  methods?: PrintMethod[];
  freeLabel?: string | null;
  disabled?: boolean;
};

export const PrintPicker = ({
  value,
  onChange,
  qty,
  methods,
  freeLabel = null,
  disabled = false,
}: Props) => {
  const allowedMethods =
    methods && methods.length > 0 ? methods : PRINT_METHODS;

  const activeMethod = value.method
    ? allowedMethods.find((m) => m.id === value.method)
    : null;

  const setMethod = (mid: string) => {
    onChange({
      method: mid === "" ? null : (mid as PrintSelection["method"]),
      options: [],
    });
  };

  const toggleOption = (oid: string) => {
    onChange({
      ...value,
      options: value.options.includes(oid)
        ? value.options.filter((x) => x !== oid)
        : [...value.options, oid],
    });
  };

  const perPc = printPricePerPc(value, allowedMethods);
  const totalCharge = perPc * qty;

  // Disabled product
  if (disabled) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm text-xl">
            🔒
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">
              Printing Unavailable
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              No printing is available for this product.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Free printing
  if (freeLabel) {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white shadow-sm">
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                Printing Included
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                {freeLabel}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-white shadow-sm">
            FREE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">

      {/* Main Heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-extrabold tracking-tight">
              Choose Your Print Type
            </h4>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
              Customize
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Select the perfect printing style for your product.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <span className="text-xl">✦</span>
        </div>
      </div>

      {/* No Printing Card */}
      <label
        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
          !value.method
            ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md ring-1 ring-primary/30"
            : "border-border bg-background shadow-sm hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <input
          type="radio"
          name="print-method"
          value=""
          checked={!value.method}
          onChange={() => setMethod("")}
          className="h-4 w-4 accent-primary"
        />

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
          👕
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold">No Printing</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep your product plain without printing.
          </p>
        </div>

        <span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold">
          FREE
        </span>
      </label>

      {/* Printing Method Cards */}
      <div className="space-y-3">
        {allowedMethods.map((m, index) => {
          const selected = value.method === m.id;

          return (
            <label
              key={m.id}
              className={`relative block cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
                selected
                  ? "border-primary bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-lg ring-1 ring-primary/30"
                  : "border-border bg-background shadow-sm hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              {/* Selected Accent */}
              {selected && (
                <div className="absolute left-0 top-0 h-full w-1 bg-primary" />
              )}

              <div className="p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <input
                    type="radio"
                    name="print-method"
                    value={m.id}
                    checked={selected}
                    onChange={() => setMethod(m.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-xl shadow-sm">
                    {["✦", "◈", "✧"][index % 3]}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="text-sm font-extrabold">
                        {m.label}
                      </h5>

                      {selected ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                          ✓ Selected
                        </span>
                      ) : (
                        <span className="rounded-full bg-secondary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Choose
                        </span>
                      )}
                    </div>

                    {m.note && (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {m.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Customization Area */}
                {selected && (
                  <div className="mt-4 space-y-3">

                    <div className="rounded-xl border border-border/70 bg-background/80 p-3 shadow-sm">

                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          ✦
                        </span>
                        <div>
                          <p className="text-xs font-extrabold">
                            Customize Your Printing
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Choose the areas you want printed.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {m.options.map((o) => {
                          const checked = value.options.includes(o.id);

                          return (
                            <label
                              key={o.id}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200 ${
                                checked
                                  ? "border-primary/50 bg-primary/5 shadow-sm"
                                  : "border-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/60"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleOption(o.id)}
                                  className="h-4 w-4 shrink-0 accent-primary"
                                />
                                <span className="text-xs font-semibold">
                                  {o.label}
                                </span>
                              </span>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${
                                  o.pricePerPc === 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {o.pricePerPc === 0
                                  ? "FREE"
                                  : `+₹${o.pricePerPc}/pc`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Summary */}
                    {value.options.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-extrabold">
                              Your Printing Cost
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              ₹{perPc} per piece × {qty} pieces
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Total
                            </p>
                            <p className="text-2xl font-black tracking-tight text-primary">
                              ₹{totalCharge}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Help Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50/70 to-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            💡
          </div>
          <div>
            <h5 className="text-xs font-extrabold text-amber-950">
              Need Help Choosing?
            </h5>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/70">
              Select a printing method to explore its customization
              options and additional charges. You can change your
              selection anytime.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
