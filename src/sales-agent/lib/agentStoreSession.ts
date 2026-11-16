export type AgentStoreSession = {
  shareToken: string;
  salesAgentId: string;
  agentName: string;
  savedAt: number;
};

const KEY = "arr_agent_store_session_v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function saveAgentStoreSession(session: Omit<AgentStoreSession, "savedAt">) {
  const payload: AgentStoreSession = { ...session, savedAt: Date.now() };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadAgentStoreSession(): AgentStoreSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AgentStoreSession>;
    if (
      !parsed?.shareToken ||
      !parsed?.salesAgentId ||
      typeof parsed.savedAt !== "number"
    ) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed as AgentStoreSession;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function clearAgentStoreSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function getAgentShareToken(): string | null {
  return loadAgentStoreSession()?.shareToken ?? null;
}