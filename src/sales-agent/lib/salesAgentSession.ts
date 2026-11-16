import type { SalesAgent } from "../types/salesAgent";

const SESSION_KEY = "arr_sales_agent_session_v1";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

type SalesAgentSession = {
  agent: SalesAgent;
  verifiedCode: string;
  savedAt: number;
};

export function saveSalesAgentSession(agent: SalesAgent, verifiedCode: string) {
  const payload: SalesAgentSession = {
    agent,
    verifiedCode,
    savedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function loadSalesAgentSession(): SalesAgentSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SalesAgentSession>;

    if (
      !parsed ||
      typeof parsed.savedAt !== "number" ||
      typeof parsed.verifiedCode !== "string" ||
      !parsed.agent ||
      typeof parsed.agent.id !== "string" ||
      typeof parsed.agent.code !== "string"
    ) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed as SalesAgentSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSalesAgentSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getSalesAgentId(): string | null {
  return loadSalesAgentSession()?.agent.id ?? null;
}