import { cn } from "@/lib/utils";

function DualArc({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-dual-arc-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          "relative inline-block h-10 w-10 shrink-0",
          className
        )}
        style={style}
        {...props}
      >
        <span
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-current border-r-current"
          style={{
            animation: "loading-ui-dual-arc-spin 0.9s linear infinite",
          }}
        />
        <span
          className="absolute inset-1.5 rounded-full border-[3px] border-transparent border-b-current border-l-current opacity-70"
          style={{
            animation: "loading-ui-dual-arc-spin 1.4s linear infinite reverse",
          }}
        />
      </div>
    </>
  );
}

export { DualArc };
export default DualArc;
