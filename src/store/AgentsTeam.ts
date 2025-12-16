import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import router from '@/router';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import { useAlertStore } from './Alert';
import agentIconService from '@/utils/agentIconService';

// @ts-expect-error - unnnicToastManager is not typed
import { unnnicToastManager } from '@weni/unnnic-system';

import i18n from '@/utils/plugins/i18n';

import { useFeatureFlagsStore } from './FeatureFlags';
import { Agent, AgentGroupOrAgent } from './types/Agents.types';

export const useAgentsTeamStore = defineStore('AgentsTeam', () => {
  const linkToCreateAgent = 'https://github.com/weni-ai/weni-cli';

  const assignAgentsView = useFeatureFlagsStore().flags.assignAgentsView;

  const alertStore = useAlertStore();

  const activeTeam = reactive({
    status: null,
    data: {
      manager: null,
      agents: [],
    },
  });

  const officialAgents = reactive({
    status: null,
    data: [],
  });

  const myAgents = reactive({
    status: null,
    data: [],
  });

  const allAgents = computed(() => {
    return {
      manager: activeTeam.data.manager,
      agents: [...officialAgents.data, ...myAgents.data],
    };
  });

  const isAgentsGalleryOpen = ref(false);

  async function loadActiveTeam() {
    try {
      activeTeam.status = 'loading';

      const { data } = await nexusaiAPI.router.agents_team.listActiveTeam();

      activeTeam.data = {
        manager: data.manager,
        agents: agentIconService.applyIconsToAgents(data.agents),
      };
      activeTeam.status = 'complete';
    } catch (error) {
      console.error('error', error);

      activeTeam.status = 'error';
    }
  }

  async function loadOfficialAgents(
    { search, category, group, system } = {
      search: '',
      category: '',
      group: '',
      system: '',
    },
  ) {
    try {
      officialAgents.status = 'loading';

      let response: AgentGroupOrAgent[] = [];

      if (assignAgentsView) {
        response = await nexusaiAPI.router.agents_team.listOfficialAgents2({
          category,
          group,
          system,
          name: search,
        });
      } else {
        const { data } = await nexusaiAPI.router.agents_team.listOfficialAgents(
          {
            search,
          },
        );
        response = data;
      }

      officialAgents.data = agentIconService.applyIconsToAgents(response);
      officialAgents.status = 'complete';
    } catch (error) {
      console.error('error', error);

      officialAgents.status = 'error';
    }
  }

  async function loadMyAgents({ search = '' } = {}) {
    try {
      myAgents.status = 'loading';

      const { data } = await nexusaiAPI.router.agents_team.listMyAgents({
        search,
      });

      myAgents.data = agentIconService.applyIconsToAgents(data);
      myAgents.status = 'complete';
    } catch (error) {
      console.error('error', error);

      myAgents.status = 'error';
    }
  }

  async function toggleAgentAssignment({ uuid, is_assigned }) {
    if (!uuid || typeof is_assigned !== 'boolean') {
      throw new Error('uuid and is_assigned are required');
    }

    try {
      const agent =
        officialAgents.data.find((agent) => agent.uuid === uuid) ||
        myAgents.data.find((agent) => agent.uuid === uuid);

      if (!agent) {
        throw new Error('Agent not found');
      }

      const { data } =
        await nexusaiAPI.router.agents_team.toggleAgentAssignment({
          agentUuid: agent?.uuid,
          is_assigned,
        });

      agent.assigned = data.assigned;

      if (is_assigned) {
        activeTeam.data.agents.push(agent);
      } else {
        activeTeam.data.agents = activeTeam.data.agents.filter(
          (agent) => agent.uuid !== uuid,
        );
      }

      const cardText = (key: string, options?: Record<string, string>) =>
        i18n.global.t(`router.agents_team.card.${key}`, options);

      unnnicToastManager.success(
        cardText(
          is_assigned ? 'success_assign_alert' : 'success_unassign_alert',
          {
            agent: agent.name,
          },
        ),
        is_assigned ? cardText('success_assign_alert_description') : undefined,
      );

      return {
        status: 'success',
      };
    } catch (error) {
      console.error('error', error);

      alertStore.add({
        text: i18n.global.t('router.agents_team.card.error_alert'),
        type: 'error',
      });

      return {
        status: 'error',
      };
    }
  }

  async function deleteAgent(agent: Agent) {
    if (!agent) {
      throw new Error('Agent not found');
    }

    try {
      await nexusaiAPI.router.agents_team.deleteAgent(agent.uuid);

      myAgents.data = myAgents.data.filter(
        (mappedAgent) => mappedAgent.uuid !== agent.uuid,
      );

      alertStore.add({
        text: i18n.global.t(
          'router.agents_team.modal_delete_agent.success_alert',
          { agent_name: agent.name },
        ),
        type: 'success',
      });
    } catch (error) {
      console.error('error', error);

      alertStore.add({
        text: i18n.global.t(
          'router.agents_team.modal_delete_agent.error_alert',
        ),
        type: 'error',
      });
    }
  }

  function openAgentsGallery() {
    if (useFeatureFlagsStore().flags.assignAgentsView) {
      router.push({ name: 'agents-assign' });
      return;
    }

    isAgentsGalleryOpen.value = true;
  }

  return {
    linkToCreateAgent,
    activeTeam,
    officialAgents,
    myAgents,
    allAgents,
    isAgentsGalleryOpen,
    loadActiveTeam,
    loadOfficialAgents,
    loadMyAgents,
    toggleAgentAssignment,
    deleteAgent,
    openAgentsGallery,
  };
});
