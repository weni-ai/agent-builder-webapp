import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import router from '@/router';

import nexusaiAPI from '@/api/nexusaiAPI.js';
import { useAlertStore } from './Alert';
import agentIconService from '@/utils/agentIconService';

import { unnnicToastManager } from '@weni/unnnic-system';

import i18n from '@/utils/plugins/i18n';

import { useFeatureFlagsStore } from './FeatureFlags';
import {
  Agent,
  ActiveTeamAgent,
  AgentGroupOrAgent,
  AgentSystem,
  AssignAgentsFilters,
} from './types/Agents.types';
import useAgent from '@/composables/useAgent';

export const useAgentsTeamStore = defineStore('AgentsTeam', () => {
  const linkToCreateAgent = 'https://github.com/weni-ai/weni-cli';

  const assignAgentsView = useFeatureFlagsStore().flags.assignAgentsView;

  const alertStore = useAlertStore();
  const { normalizeActiveAgent } = useAgent();

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

  const availableSystems = ref<AgentSystem[]>([]);

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

  const newAgentAssigned = ref<ActiveTeamAgent | null>(null);

  function addAgentToTeam(agent: AgentGroupOrAgent) {
    const normalizedAgent = normalizeActiveAgent(agent);

    activeTeam.data.agents.push(normalizedAgent);
    newAgentAssigned.value = normalizedAgent;

    if (router.currentRoute.value.name !== 'agents-team') {
      router.push({ name: 'agents-team' });
    }

    const assignedAgent = officialAgents.data.find(
      (agent) =>
        agent.uuid === normalizedAgent.uuid ||
        agent.variants?.some(
          (variant) => variant.uuid === normalizedAgent.uuid,
        ),
    );
    assignedAgent.assigned = true;
  }

  async function loadActiveTeam() {
    try {
      activeTeam.status = 'loading';

      const { data } = await nexusaiAPI.router.agents_team.listActiveTeam();

      activeTeam.data = {
        manager: data.manager,
        agents: data.agents.map(normalizeActiveAgent),
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
      let availableSystemsResponse: AgentSystem[] = [];

      if (assignAgentsView) {
        const { system, search, category } = assignAgentsFilters;

        const { agents, availableSystems } =
          await nexusaiAPI.router.agents_team.listOfficialAgents2({
            name: search,
            category: category?.[0]?.value ?? '',
            system: system === 'ALL_OFFICIAL' ? '' : system,
          });

        response = agents;
        availableSystemsResponse = availableSystems ?? [];
      } else {
        const { data } = await nexusaiAPI.router.agents_team.listOfficialAgents(
          {
            search,
          },
        );
        response = data;
        availableSystemsResponse = [];
      }

      officialAgents.data = agentIconService.applyIconsToAgents(response);
      availableSystems.value = availableSystemsResponse;
      officialAgents.status = 'complete';
    } catch (error) {
      console.error('error', error);

      officialAgents.status = 'error';
      availableSystems.value = [];
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
        officialAgents.data.find(
          (agent) =>
            agent.uuid === uuid ||
            agent.agents?.some((variant) => variant.uuid === uuid),
        ) || myAgents.data.find((agent) => agent.uuid === uuid);

      if (!agent) {
        throw new Error('Agent not found');
      }

      if (assignAgentsView && agent.is_official) {
        await nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment({
          agent_uuid: uuid,
          assigned: is_assigned,
        });
      } else {
        await nexusaiAPI.router.agents_team.toggleAgentAssignment({
          agentUuid: (agent as Agent)?.uuid,
          is_assigned,
        });
      }

      agent.assigned = is_assigned;

      if (is_assigned) {
        addAgentToTeam(agent);
      } else {
        activeTeam.data.agents = activeTeam.data.agents.filter(
          (agent) => agent.uuid !== uuid,
        );
      }

      const cardText = (key: string, options?: Record<string, string>) =>
        i18n.global.t(`router.agents_team.card.${key}`, options);

      if (is_assigned) {
        unnnicToastManager.success(
          cardText('success_assign_alert', { agent: agent.name }),
          cardText('success_assign_alert_description'),
        );
      } else {
        unnnicToastManager.info(
          cardText('info_unassign_alert', { agent: agent.name }),
        );
      }

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
    if (assignAgentsView) {
      router.push({ name: 'agents-assign' });
      return;
    }

    isAgentsGalleryOpen.value = true;
  }

  return {
    newAgentAssigned,
    linkToCreateAgent,
    activeTeam,
    officialAgents,
    availableSystems,
    myAgents,
    assignAgentsFilters,
    allAgents,
    isAgentsGalleryOpen,
    addAgentToTeam,
    loadActiveTeam,
    loadOfficialAgents,
    loadMyAgents,
    toggleAgentAssignment,
    deleteAgent,
    openAgentsGallery,
    setAssignAgentsFilters,
  };
});
