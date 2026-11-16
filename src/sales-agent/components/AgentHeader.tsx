import { LogOut } from "lucide-react";
import type { SalesAgent } from "../types/salesAgent";

type Props = {
  agent: SalesAgent;
  onLogout: () => void;
  title?: string;
};

export function AgentHeader({ agent, onLogout, title = "Sales Agent Panel" }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {agent.name} · <span className="font-mono">{agent.code}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}