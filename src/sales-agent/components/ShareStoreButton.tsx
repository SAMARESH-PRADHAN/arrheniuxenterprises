// import { useState } from "react";
// import { Copy, Check } from "lucide-react";
// import { buildShareStoreUrl } from "../lib/salesAgentApi";

// type Props = {
//   shareToken: string;
// };

// export function ShareStoreButton({ shareToken }: Props) {
//   const [copied, setCopied] = useState(false);
//   const url = buildShareStoreUrl(shareToken);

//   const copy = async () => {
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch {
//       // ignore
//     }
//   };

//   return (
//     <div className="space-y-2">
//       <div className="break-all rounded-md border bg-muted/40 px-3 py-2 text-xs font-mono">{url}</div>
//       <button
//         type="button"
//         onClick={copy}
//         className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
//       >
//         {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
//         {copied ? "Copied" : "Copy Share Store link"}
//       </button>
//     </div>
//   );
// }

import { useState } from "react";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { buildShareStoreUrl } from "../lib/salesAgentApi";

type Props = {
  shareToken: string;
  agentName?: string;
};

export function ShareStoreButton({ shareToken, agentName }: Props) {
  const [copied, setCopied] = useState(false);
  const url = buildShareStoreUrl(shareToken);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({
        title: agentName ? `${agentName} · Arrheniux Store` : "Arrheniux Agent Store",
        text: "Shop exclusive agent prices on Arrheniux",
        url,
      });
    } catch {
      // user cancelled — ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/30 px-3 py-2">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Public store link
        </div>
        <div className="mt-1 break-all font-mono text-xs">{url}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>

        <button
          type="button"
          onClick={() => void nativeShare()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
      </div>
    </div>
  );
}