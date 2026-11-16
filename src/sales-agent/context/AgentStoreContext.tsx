import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAgentStoreSession,
  loadAgentStoreSession,
  saveAgentStoreSession,
  type AgentStoreSession,
} from "../lib/agentStoreSession";

type AgentStoreContextValue = {
  session: AgentStoreSession | null;
  isAgentStore: boolean;
  activate: (session: Omit<AgentStoreSession, "savedAt">) => void;
  clear: () => void;
};

const AgentStoreContext = createContext<AgentStoreContextValue | null>(null);

export function AgentStoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AgentStoreSession | null>(null);

  useEffect(() => {
    setSession(loadAgentStoreSession());
  }, []);

  const activate = useCallback((s: Omit<AgentStoreSession, "savedAt">) => {
    saveAgentStoreSession(s);
    setSession({ ...s, savedAt: Date.now() });
  }, []);

  const clear = useCallback(() => {
    clearAgentStoreSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAgentStore: !!session,
      activate,
      clear,
    }),
    [session, activate, clear],
  );

  return (
    <AgentStoreContext.Provider value={value}>{children}</AgentStoreContext.Provider>
  );
}

export function useAgentStore() {
  const ctx = useContext(AgentStoreContext);
  if (!ctx) {
    return {
      session: null,
      isAgentStore: false,
      activate: () => {},
      clear: () => {},
    };
  }
  return ctx;
}