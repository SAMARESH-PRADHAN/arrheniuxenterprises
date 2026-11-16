import { useAgentStore } from "../context/AgentStoreContext";

export function AgentStoreBanner() {
  const { session, isAgentStore, clear } = useAgentStore();
  if (!isAgentStore || !session) return null;

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">
      Shopping via <span className="font-semibold">{session.agentName}</span>
      {" · "}
      agent prices applied
      {" · "}
      <button
        type="button"
        onClick={clear}
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        Exit agent store
      </button>
    </div>
  );
}