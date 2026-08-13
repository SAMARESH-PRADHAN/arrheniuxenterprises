import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAgent, createAgentVisit, fetchAgents } from "@/lib/api";
import { queryKeys } from "./queryKeys";

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: fetchAgents,
  });
}

export function useVerifyAgentCode() {
  const { data: agents } = useAgents();
  return {
    verify: (code: string) => {
      const normalized = code.trim().toUpperCase();
      const agent = agents?.find(
        (a) => a.code.toUpperCase() === normalized && a.status === "Active",
      );
      return agent ?? null;
    },
    isLoading: !agents,
  };
}

export type AgentRegistrationResult = {
  id: string;
  code: string;
  company: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
};

export function useRegisterAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      code: string;
      company: string;
      contactPerson: string;
      mobile: string;
      email: string;
      gst: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      existingAgentId?: string;
    }): Promise<AgentRegistrationResult> => {
      let agentId = input.existingAgentId;

      if (!agentId) {
        const agent = await createAgent({
          code: input.code,
          name: input.contactPerson,
          phone: input.mobile,
          email: input.email,
          address: `${input.address}, ${input.city}, ${input.state} - ${input.pincode}`,
        });
        agentId = agent.id;
      }

      await createAgentVisit({
        agentId,
        agentCode: input.code,
        agentName: input.contactPerson,
        customerName: input.contactPerson,
        customerPhone: input.mobile,
        customerEmail: input.email,
        companyName: input.company,
        address: input.address,
        city: input.city,
        gstNumber: input.gst,
        outcome: "Interested",
        requirement: "B2B shop registration",
        notes: `State: ${input.state}, Pincode: ${input.pincode}`,
      });

      await qc.invalidateQueries({ queryKey: queryKeys.agents });

      return {
        id: agentId,
        code: input.code,
        company: input.company,
        contactPerson: input.contactPerson,
        mobile: input.mobile,
        email: input.email,
        gst: input.gst,
        address: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        createdAt: new Date().toISOString(),
      };
    },
  });
}
