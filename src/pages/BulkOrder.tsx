import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, CreditCard } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PrintPicker } from "@/components/PrintPicker";
// TEMPORARY STUB - full file restore needed
export default function BulkOrder() {
  return (
    <Layout>
      <SEO title="Bulk Order" description="Bulk order custom apparel" path="/bulk-order" />
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-4xl">Bulk Order</h1>
        <p className="mt-4 text-muted-foreground">Page temporarily simplified during SEO update. Full form will be restored shortly.</p>
      </div>
    </Layout>
  );
}
