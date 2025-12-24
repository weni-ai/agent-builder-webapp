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
    createInitialConfig(agent.value) as ConciergeAssignmentConfig,
  );
  const isSubmitting = ref(false);

  watch(
    () => agent.value?.uuid,
    () => {
      config.value = createInitialConfig(
        agent.value,
      ) as ConciergeAssignmentConfig;
    },
  );

  function resetAssignment() {
    config.value = createInitialConfig(
      agent.value,
    ) as ConciergeAssignmentConfig;
    isSubmitting.value = false;
  }

  function createInitialConfig(currentAgent?: AgentGroup | null) {
    return {
      system: (currentAgent?.systems?.[0] || 'VTEX') as AgentSystem,
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
      const payload = {
        project_uuid: projectStore.uuid,
        agent_uuid: agent.value.uuid,
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
