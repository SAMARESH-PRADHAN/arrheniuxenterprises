import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchPublicSalesAgent } from "../lib/salesAgentApi";
import { useAgentStore } from "../context/AgentStoreContext";

export default function AgentStoreEntry() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { activate } = useAgentStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!shareToken?.trim()) {
        setError("Invalid store link");
        return;
      }
      try {
        const agent = await fetchPublicSalesAgent(shareToken.trim());
        if (cancelled) return;
        activate({
          shareToken: agent.shareToken,
          salesAgentId: agent.id,
          agentName: agent.name,
        });
        navigate("/", { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Store not found or inactive");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [shareToken, activate, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold">Store unavailable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        <Link to="/" className="text-sm font-medium text-emerald-700 hover:underline">
          Continue to Arrheniux
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Opening agent store…
    </div>
  );
}