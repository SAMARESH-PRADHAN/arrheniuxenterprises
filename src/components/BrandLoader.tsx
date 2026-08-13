import { createPortal } from "react-dom";
import { DualArc } from "@/components/ui/dual-arc";

export const BrandLoader = ({
  fullscreen = false,
  label = "Loading",
  size = 56,
}: {
  fullscreen?: boolean;
  label?: string;
  size?: number;
}) => {
  const content = (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <DualArc style={{ width: size, height: size }} className="text-primary" />
      <span className="font-display tracking-[0.25em] text-[11px] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="sr-only">{label}…</span>
    </div>
  );

  if (!fullscreen) return content;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-md">
      <div className="relative">{content}</div>
    </div>,
    document.body
  );
};

export default BrandLoader;