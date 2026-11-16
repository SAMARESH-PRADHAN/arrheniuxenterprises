import { useCallback, useEffect, useState } from "react";
import type { SalesAgent } from "../types/salesAgent";
import {
  clearSalesAgentSession,
  loadSalesAgentSession,
  saveSalesAgentSession,
} from "../lib/salesAgentSession";
import { salesAgentLogin } from "../lib/salesAgentApi";

export function useSalesAgent() {
  const [agent, setAgent] = useState<SalesAgent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSalesAgentSession();
    setAgent(session?.agent ?? null);
    setLoading(false);
  }, []);

  const login = useCallback(async (code: string) => {
    // const res = await salesAgentLogin(code);
    // saveSalesAgentSession(res.agent, code.trim());
    // setAgent(res.agent);
    // return res.agent;
    const trimmed = code.trim();
    if (!trimmed) {
      throw new Error("Agent code is required");
    }
    const res = await salesAgentLogin(trimmed);
    if (!res?.agent?.id) {
      throw new Error("Invalid login response");
    }
    saveSalesAgentSession(res.agent, trimmed);
    setAgent(res.agent);
    return res.agent;
  }, []);

  const logout = useCallback(() => {
    clearSalesAgentSession();
    setAgent(null);
  }, []);

  return {
    agent,
    isAuthenticated: !!agent,
    loading,
    login,
    logout,
  };
}