import { useState } from "react";
import type { SalesAgentProduct } from "../types/salesAgent";

type Props = {
  product: SalesAgentProduct;
  onSave: (agentPrice: number) => Promise<void>;
  onClose: () => void;
};

export function AgentPriceEditor({ product, onSave, onClose }: Props) {
  const [value, setValue] = useState(String(product.agentPrice));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
        const MAX_EXTRA = 100;
    const maxPrice = product.originalPrice + MAX_EXTRA;
    const price = Number(value);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price");
      return;
    }
    if (price < product.originalPrice) {
      setError(`Cannot go below MRP ₹${product.originalPrice}`);
      return;
    }
    if (price > maxPrice) {
      setError(`Maximum is MRP + ₹${MAX_EXTRA} (₹${maxPrice})`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(price);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
<div className="rounded-xl border border-border bg-background p-4 text-foreground shadow-lg">
<div className="text-sm font-semibold text-foreground">{product.name}</div>
      <div className="text-xs text-muted-foreground">Min: ₹{product.originalPrice}</div>
      <input
        type="number"
        min={product.originalPrice}
        max={product.originalPrice + 100}
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
            <p className="mt-1 text-xs text-muted-foreground">
        MRP ₹{product.originalPrice} · Allowed ₹{product.originalPrice} – ₹
        {product.originalPrice + 100}
      </p>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted"
  onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
          disabled={saving}
          onClick={submit}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}