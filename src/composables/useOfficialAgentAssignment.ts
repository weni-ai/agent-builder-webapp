import { ref, watch, type Ref } from 'vue';

import {
  AgentGroup,
  AgentMCP,
  AgentSystem,
  ConciergeVariant,
} from '@/store/types/Agents.types';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useProjectStore } from '@/store/Project';
import nexusaiAPI from '@/api/nexusaiAPI';

export type MCPConfigValues = Record<string, string | string[] | boolean>;

export type ConciergeAssignmentConfig = {
  system: AgentSystem;
  variant: {
    type: ConciergeVariant | '';
    config: null;
  };
  mcp_config: MCPConfigValues;
  MCP: AgentMCP | null;
};

export default function useOfficialAgentAssignment(agent: Ref<AgentGroup>) {
  const projectStore = useProjectStore();
  const agentsTeamStore = useAgentsTeamStore();

  const config = ref<ConciergeAssignmentConfig>(
    createInitialConfig() as ConciergeAssignmentConfig,
  );
  const isSubmitting = ref(false);

  watch(
    () => agent.value?.variants?.map((variant) => variant.uuid).join(','),
    () => {
      config.value = createInitialConfig() as ConciergeAssignmentConfig;
    },
  );

  function resetAssignment() {
    config.value = createInitialConfig() as ConciergeAssignmentConfig;
    isSubmitting.value = false;
  }

  function createInitialConfig() {
    return {
      system: 'VTEX' as AgentSystem,
      variant: {
        type: '',
        config: null,
      },
      mcp_config: {},
      MCP: null,
    };
  }

  async function submitAssignment() {
    if (!agent.value || !config.value.MCP) {
      return false;
    }

    isSubmitting.value = true;

    try {
      const agentUuid = findAgentVariantUuid(agent.value, config.value.system);
      if (!agentUuid) {
        isSubmitting.value = false;
        return false;
      }
      const payload = {
        project_uuid: projectStore.uuid,
        agent_uuid: agentUuid,
        assigned: true,
        system: config.value.system,
      };

      await nexusaiAPI.router.agents_team.assignOfficialAgent(payload);

      await Promise.all([
        agentsTeamStore.loadActiveTeam(),
        agentsTeamStore.loadOfficialAgents(),
      ]);

      // TODO: Add success toast

      return true;
    } catch (error) {
      console.error('Failed to assign official agent', error);
      // TODO: Add error toast
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    config,
    isSubmitting,
    resetAssignment,
    submitAssignment,
  };
}

export function findAgentVariantUuid(
  agent: AgentGroup | null,
  system: AgentSystem,
): string | null {
  if (!agent) return null;

  const variant = agent.variants.find(
    (currentVariant) =>
      currentVariant.variant.toUpperCase() === 'DEFAULT' &&
      system.toLowerCase() === currentVariant.systems[0]?.toLowerCase(),
  );

  return variant?.uuid ?? null;
}
