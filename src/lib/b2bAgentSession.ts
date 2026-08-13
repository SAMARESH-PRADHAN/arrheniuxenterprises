import type { AgentRegistrationResult } from "@/hooks/api";

const SESSION_KEY = "arr_b2b_agent_session_v1";
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

type B2BAgentSession = {
  agent: AgentRegistrationResult;
  verifiedCode: string;
  savedAt: number; // epoch ms
};

export function saveB2BAgentSession(agent: AgentRegistrationResult, verifiedCode: string) {
  const payload: B2BAgentSession = { agent, verifiedCode, savedAt: Date.now() };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage can throw in rare private-mode/quota cases — fail silently,
    // the agent just won't get refresh persistence this session.
  }
}

export function loadB2BAgentSession(): B2BAgentSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<B2BAgentSession>;

    // Shape check — don't trust corrupted/old-version blobs
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

    // Expiry check
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed as B2BAgentSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearB2BAgentSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function remainingB2BAgentSessionMs(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Partial<B2BAgentSession>;
    if (typeof parsed.savedAt !== "number") return 0;
    return Math.max(0, SESSION_TTL_MS - (Date.now() - parsed.savedAt));
  } catch {
    return 0;
  }
}