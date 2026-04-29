import { ref, type Ref } from 'vue';

import { Agent, AgentCredential } from '@/store/types/Agents.types';

import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';

export type ConstantsValues = Record<string, string | string[] | boolean>;

export type CustomAssignmentConfig = {
  constants: ConstantsValues;
  credentials: Record<string, string>;
};

type CredentialPayload = AgentCredential & {
  value: string;
};

export default function useCustomAgentAssignment(agent: Ref<Agent>) {
  const config = ref<CustomAssignmentConfig>(createInitialConfig());
  const agentsTeamStore = useAgentsTeamStore();
  const tuningsStore = useTuningsStore();

  const isSubmitting = ref(false);

  function createInitialConfig(): CustomAssignmentConfig {
    return {
      constants: {},
      credentials: {},
    };
  }

  function resetAssignment() {
    config.value = createInitialConfig();
    isSubmitting.value = false;
  }

  function buildCredentialsPayload(): CredentialPayload[] {
    if (!agent.value?.credentials?.length) {
      return [];
    }

    return agent.value.credentials.map((credential) => ({
      ...credential,
      value: config.value.credentials[credential.name] ?? '',
    }));
  }

  async function submitAssignment() {
    if (!agent.value?.uuid) {
      return false;
    }

    isSubmitting.value = true;

    try {
      const credentialsPayload = buildCredentialsPayload();

      if (credentialsPayload.length) {
        await tuningsStore.createCredentials(
          agent.value.uuid,
          credentialsPayload,
        );
      }

      await nexusaiAPI.router.agents_team.toggleAgentAssignment({
        agentUuid: agent.value.uuid,
        is_assigned: true,
        mcp_config: config.value.constants,
      });

      agentsTeamStore.addAgentToTeam(agent.value);

      return true;
    } catch (error) {
      console.error('Failed to assign custom agent', error);
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
