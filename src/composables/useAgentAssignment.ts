import { ref, watch, type Ref } from 'vue';

import { Agent, AgentCredential, AgentMCP } from '@/store/types/Agents.types';

import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

export type AssignmentValues = Record<string, string | string[] | boolean>;

export type AgentAssignmentConfig = {
  system: string;
  MCP: AgentMCP | null;
  mcp_config: AssignmentValues;
  credentials: Record<string, string>;
};

type CredentialPayload = AgentCredential & {
  value: string;
};

export default function useAgentAssignment(agent: Ref<Agent>) {
  const agentsTeamStore = useAgentsTeamStore();

  const config = ref<AgentAssignmentConfig>(createInitialConfig());
  const isSubmitting = ref(false);

  function createInitialConfig(): AgentAssignmentConfig {
    const isOfficial = agent.value?.is_official;
    const hasVTEXSystem = agent.value?.systems?.some(
      (system) => system.toLowerCase() === 'vtex',
    );
    const initialMCP = isOfficial ? null : (agent.value?.mcps?.[0] ?? null);

    return {
      system: isOfficial && hasVTEXSystem ? 'vtex' : '',
      MCP: initialMCP,
      mcp_config: {},
      credentials: buildEmptyCredentialsMap(initialMCP),
    };
  }

  function buildEmptyCredentialsMap(mcp: AgentMCP | null) {
    return (mcp?.credentials ?? []).reduce((acc, credential) => {
      acc[credential.name] = '';
      return acc;
    }, {});
  }

  function resetAssignment() {
    config.value = createInitialConfig();
    isSubmitting.value = false;
  }

  watch(
    () => config.value.MCP,
    (nextMCP) => {
      if (!nextMCP?.credentials?.length) {
        config.value.credentials = {};
        return;
      }

      const previousValues = { ...config.value.credentials };
      const nextValues = nextMCP.credentials.reduce((acc, credential) => {
        acc[credential.name] = previousValues[credential.name] ?? '';
        return acc;
      }, {});

      config.value.credentials = nextValues;
    },
    { immediate: true },
  );

  function buildCredentialsPayload(): CredentialPayload[] {
    const credentials = config.value.MCP?.credentials ?? [];
    if (!credentials.length) {
      return [];
    }

    return credentials.map((credential) => ({
      ...credential,
      value: config.value.credentials[credential.name] ?? '',
    }));
  }

  async function submitOfficialAssignment(): Promise<boolean> {
    if (!config.value.MCP || !agent.value?.group) {
      return false;
    }

    const selectedMCP = config.value.MCP;
    const payload = {
      group: agent.value.group,
      assigned: true,
      system: config.value.system,
      mcp: selectedMCP.name,
      mcp_config: config.value.mcp_config,
      credentials: buildCredentialsPayload(),
    };

    const { data } =
      await nexusaiAPI.router.agents_team.toggleAgentAssignment(payload);

    const assignedConfig = (selectedMCP.config ?? []).map((field) => ({
      ...field,
      value: config.value.mcp_config[field.name] ?? null,
    }));

    const assignedMCP: AgentMCP = {
      name: selectedMCP.name,
      description: selectedMCP.description ?? { en: '', pt: '', es: '' },
      system: config.value.system,
      credentials: selectedMCP.credentials ?? [],
      config: assignedConfig,
    };

    const normalizedAgent: Agent = {
      ...agent.value,
      uuid: data.agent.uuid,
      id: data.agent.slug,
      systems: [config.value.system],
      mcps: [assignedMCP],
    };

    agentsTeamStore.addAgentToTeam(normalizedAgent);
    return true;
  }

  async function submitCustomAssignment(): Promise<boolean> {
    if (!agent.value?.uuid) {
      return false;
    }

    await nexusaiAPI.router.agents_team.toggleAgentAssignment({
      agent_uuid: agent.value.uuid,
      assigned: true,
      mcp_config: config.value.mcp_config,
      credentials: buildCredentialsPayload(),
    });

    agentsTeamStore.addAgentToTeam(agent.value);
    return true;
  }

  async function submitAssignment(): Promise<boolean> {
    if (!agent.value) return false;

    isSubmitting.value = true;

    try {
      return agent.value.is_official
        ? await submitOfficialAssignment()
        : await submitCustomAssignment();
    } catch (error) {
      console.error('Failed to assign agent', error);
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
}
