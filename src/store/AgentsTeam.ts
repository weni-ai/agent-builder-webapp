import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import router from '@/router';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import { useAlertStore } from './Alert';
import agentIconService from '@/utils/agentIconService';

import i18n from '@/utils/plugins/i18n';

import { useFeatureFlagsStore } from './FeatureFlags';
import {
  Agent,
  AgentGroupOrAgent,
  AssignAgentsFilters,
} from './types/Agents.types';

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

  const assignAgentsFilters = reactive<AssignAgentsFilters>({
    search: '',
    category: [],
    system: 'ALL_OFFICIAL',
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

  function setAssignAgentsFilters(filters: Partial<AssignAgentsFilters>) {
    if (filters.search !== undefined) {
      assignAgentsFilters.search = filters.search;
    }

    if (filters.category !== undefined) {
      assignAgentsFilters.category = filters.category;
    }

    if (filters.system !== undefined) {
      assignAgentsFilters.system = filters.system;
    }
  }

  async function loadOfficialAgents({
    search,
  }: {
    search?: string;
  } = {}) {
    try {
      officialAgents.status = 'loading';

      let response: AgentGroupOrAgent[] = [];

      if (assignAgentsView) {
        const { system, search, category } = assignAgentsFilters;

        response = await nexusaiAPI.router.agents_team.listOfficialAgents2({
          name: search,
          category: category?.[0]?.value ?? '',
          system: system === 'ALL_OFFICIAL' ? '' : system,
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
        search: assignAgentsView ? assignAgentsFilters.search : search,
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

      alertStore.add({
        text: i18n.global.t(
          is_assigned
            ? 'router.agents_team.card.success_assign_alert'
            : 'router.agents_team.card.success_unassign_alert',
          {
            agent: agent.name,
          },
        ),
        type: 'success',
      });

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
    assignAgentsFilters,
    allAgents,
    isAgentsGalleryOpen,
    loadActiveTeam,
    loadOfficialAgents,
    loadMyAgents,
    toggleAgentAssignment,
    deleteAgent,
    openAgentsGallery,
    setAssignAgentsFilters,
  };
});
