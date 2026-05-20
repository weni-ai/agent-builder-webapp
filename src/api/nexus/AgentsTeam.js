import { computed } from 'vue';
import request from '@/api/nexusaiRequest';
import { useProjectStore } from '@/store/Project';
import { cleanParams } from '@/utils/http';

const projectUuid = computed(() => useProjectStore().uuid);

export const AgentsTeam = {
  async listOfficialAgents({ category, system, name }) {
    const params = cleanParams({
      project_uuid: projectUuid.value,
      category,
      system,
      name,
    });

    const { data } = await request.$http.get('/api/v1/official/agents', {
      params,
    });

    const agents = (data?.results ?? []).map((agent) => ({
      ...agent,
      id: agent.slug,
    }));

    return {
      agents,
    };
  },

  async listOfficialAvailableSystems() {
    const { data } = await request.$http.get(
      '/api/v1/official/available-systems',
      {
        params: { project_uuid: projectUuid.value },
      },
    );

    return data?.available_systems ?? [];
  },

  async toggleAgentAssignment(payload) {
    const agentId = payload.agent_uuid
      ? `&agent_uuid=${payload.agent_uuid}`
      : `&group=${payload.group}`;

    const { data } = await request.$http.post(
      `/api/v1/official/agents?project_uuid=${projectUuid.value}${agentId}`,
      payload,
      {
        hideGenericErrorAlert: true,
      },
    );

    return {
      data,
    };
  },

  async listMyAgents({ search }) {
    const params = cleanParams({
      search,
    });
    const { data } = await request.$http.get(
      `api/agents/my-agents/${projectUuid.value}`,
      {
        params,
      },
    );

    return {
      data: (data ?? []).map((agent) => ({
        ...agent,
        id: agent.slug,
      })),
    };
  },

  async listActiveTeam() {
    const { data } = await request.$http.get(
      `api/agents/teams/${projectUuid.value}`,
    );

    const { manager, agents } = data;

    return {
      data: {
        manager: {
          id: manager.id || 'manager',
        },
        agents: (agents ?? []).map((agent) => ({
          ...agent,
          id: agent.slug,
        })),
      },
    };
  },

  async deleteAgent(uuid) {
    return await request.$http.delete(
      `api/project/${projectUuid.value}/agents/${uuid}`,
    );
  },
};
