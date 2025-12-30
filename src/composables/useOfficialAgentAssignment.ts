import { ref, watch, type Ref } from 'vue';

import {
  AgentCredential,
  AgentGroup,
  AgentMCP,
  AgentSystem,
  ConciergeVariant,
} from '@/store/types/Agents.types';

import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import router from '@/router';
import agentIconService from '@/utils/agentIconService';

export type MCPConfigValues = Record<string, string | string[] | boolean>;

export type ConciergeAssignmentConfig = {
  system: AgentSystem;
  variant: {
    type: ConciergeVariant | '';
    config: null;
  };
  mcp_config: MCPConfigValues;
  MCP: AgentMCP | null;
  credentials: Record<string, string>;
};

export default function useOfficialAgentAssignment(agent: Ref<AgentGroup>) {
  const config = ref<ConciergeAssignmentConfig>(
    createInitialConfig() as ConciergeAssignmentConfig,
  );
  const agentsTeamStore = useAgentsTeamStore();
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
      credentials: {},
    };
  }

  watch(
    () => config.value.MCP,
    (nextMCP) => {
      if (!nextMCP?.credentials?.length) {
        config.value.credentials = {};
        return;
      }

      const previousValues = { ...config.value.credentials };
      const nextValues = nextMCP.credentials.reduce<Record<string, string>>(
        (acc, credential) => {
          acc[credential.name] = previousValues[credential.name] ?? '';
          return acc;
        },
        {},
      );

      config.value.credentials = nextValues;
    },
    { immediate: true },
  );

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
        agent_uuid: agentUuid,
        assigned: true,
        system: config.value.system,
        mcp: config.value.MCP.name,
        mcp_config: config.value.mcp_config,
        credentials: buildCredentialsPayload(),
      };

      const { data } =
        await nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment(
          payload,
        );

      agentsTeamStore.newAgentAssigned = data.agent;
      agentsTeamStore.activeTeam.data.agents.push(
        agentIconService.applyIconToAgent(data.agent),
      );
      if (router.currentRoute.value.name !== 'agents-team') {
        router.push({ name: 'agents-team' });
      }

      return true;
    } catch (error) {
      console.error('Failed to assign official agent', error);
      unnnicToastManager.error(
        i18n.global.t('router.agents_team.card.error_alert'),
      );
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

  function buildCredentialsPayload(): CredentialPayload[] {
    if (!config.value.MCP?.credentials?.length) {
      return [];
    }

    return config.value.MCP.credentials.map((credential) => ({
      ...credential,
      value: config.value.credentials[credential.name] ?? '',
    }));
  }
}

type CredentialPayload = AgentCredential & {
  value: string;
};

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
