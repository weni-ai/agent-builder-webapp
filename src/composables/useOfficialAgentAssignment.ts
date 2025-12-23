import { computed, ref, watch, type Ref } from 'vue';

import {
  AgentCredential,
  AgentGroup,
  AgentMCP,
  AgentSystem,
  ConciergeVariant,
} from '@/store/types/Agents.types';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useProjectStore } from '@/store/Project';
import { useTuningsStore } from '@/store/Tunings';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
// @ts-expect-error - unnnicToastManager is not typed
import { unnnicToastManager } from '@weni/unnnic-system';

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

type AgentCredentialPayload = AgentCredential & { value: string };

type CredentialsBucket = 'myAgents' | 'officialAgents';
const EMPTY_VARIANT_TYPE = '' as const;

export default function useOfficialAgentAssignment(
  agent: Ref<AgentGroup | null | undefined>,
) {
  const tuningsStore = useTuningsStore();
  const projectStore = useProjectStore();
  const agentsTeamStore = useAgentsTeamStore();

  const safeAgent = computed(() => agent.value || null);

  const config = ref<ConciergeAssignmentConfig>(
    createInitialConfig(safeAgent.value),
  );
  const isSubmitting = ref(false);

  const agentCredentials = computed(() => safeAgent.value?.credentials || []);

  watch(
    () => safeAgent.value?.uuid,
    () => {
      config.value = createInitialConfig(safeAgent.value);
    },
  );

  async function ensureCredentialsLoaded() {
    if (!tuningsStore.credentials.status) {
      await tuningsStore.fetchCredentials();
    }
  }

  function resetAssignment() {
    config.value = createInitialConfig(safeAgent.value);
    isSubmitting.value = false;
  }

  function createInitialConfig(
    currentAgent?: AgentGroup | null,
  ): ConciergeAssignmentConfig {
    return {
      system: (currentAgent?.systems?.[0] || 'VTEX') as AgentSystem,
      variant: {
        type: EMPTY_VARIANT_TYPE,
        config: null,
      },
      mcp_config: {},
      MCP: null,
    };
  }

  function getCredentialValue(credentialName: string) {
    const [index, type] = tuningsStore.getCredentialIndex(credentialName) as [
      number,
      CredentialsBucket,
    ];

    const bucket = tuningsStore.credentials.data?.[type];
    const record = Array.isArray(bucket) ? bucket[index] : null;
    const value = record?.value ?? '';

    return typeof value === 'string' ? value : value ? String(value) : '';
  }

  function buildCredentialsPayload(): AgentCredentialPayload[] {
    if (!agentCredentials.value.length) {
      return [];
    }

    return agentCredentials.value
      .map((credential) => {
        const value = getCredentialValue(credential.name);

        if (!value.trim()) {
          return null;
        }

        return {
          ...credential,
          value,
        };
      })
      .filter(Boolean) as AgentCredentialPayload[];
  }

  function normalizeMcpConfig(values: MCPConfigValues) {
    return Object.entries(values || {}).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        if (value === undefined || value === null) {
          return acc;
        }

        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }

        if (typeof value === 'string' && !value.trim()) {
          return acc;
        }

        acc[key] = value;
        return acc;
      },
      {},
    );
  }

  async function submitAssignment() {
    if (!safeAgent.value || !config.value.MCP) {
      return false;
    }

    isSubmitting.value = true;

    try {
      const payload = {
        project_uuid: projectStore.uuid,
        agent_uuid: safeAgent.value.uuid,
        assigned: true,
        system: config.value.system,
        mcp: config.value.MCP.name,
        mcp_config: normalizeMcpConfig(config.value.mcp_config),
        credentials: buildCredentialsPayload(),
      };

      await nexusaiAPI.router.agents_team.assignOfficialAgent(payload);

      await Promise.all([
        agentsTeamStore.loadActiveTeam(),
        agentsTeamStore.loadOfficialAgents(),
      ]);

      unnnicToastManager.success(
        i18n.global.t('router.agents_team.card.success_assign_alert', {
          agent: safeAgent.value.name,
        }),
        i18n.global.t(
          'router.agents_team.card.success_assign_alert_description',
        ),
      );

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
    ensureCredentialsLoaded,
    resetAssignment,
    submitAssignment,
  };
}
