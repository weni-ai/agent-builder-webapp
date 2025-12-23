import { computed } from 'vue';
import request from '@/api/nexusaiRequest';
import { useProjectStore } from '@/store/Project';
import { cleanParams } from '@/utils/http';

const projectUuid = computed(() => useProjectStore().uuid);

export const AgentsTeam = {
  async listOfficialAgents({ search }) {
    const params = cleanParams({
      search,
    });
    const { data } = await request.$http.get(
      `api/agents/official/${projectUuid.value}`,
      {
        params,
      },
    );

    return {
      data: data.map(
        ({
          uuid,
          name,
          description,
          skills,
          assigned,
          credentials,
          is_official,
          slug,
        }) => ({
          uuid,
          name,
          description,
          skills,
          assigned,
          credentials,
          is_official,
          id: slug,
        }),
      ),
    };
  },

  async listOfficialAgents2({ category, system, name }) {
    const params = cleanParams({
      project_uuid: projectUuid.value,
      category,
      system,
      name,
    });

    const { data } = await request.$http.get('/api/v1/official/agents', {
      params,
    });

    console.log('data', { ...data.legacy, ...data.new });

    return [...data.new, ...data.legacy];
  },

  async getAgentDetails(uuid) {
    const params = {
      project_uuid: projectUuid.value,
    };

    const { data } = await request.$http.get(
      `/api/v1/official/agents/${uuid}`,
      {
        params,
      },
    );
    return data;
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
      data: data.map(
        ({
          uuid,
          name,
          description,
          skills,
          assigned,
          credentials,
          is_official,
          slug,
        }) => ({
          uuid,
          name,
          description,
          skills,
          assigned,
          credentials,
          is_official,
          id: slug,
        }),
      ),
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
        agents: agents.map(
          ({
            uuid,
            name,
            skills,
            id,
            description,
            credentials,
            is_official,
          }) => ({
            uuid,
            name,
            skills,
            id,
            description,
            credentials,
            is_official,
          }),
        ),
      },
    };
  },

  async assignOfficialAgent(payload) {
    const { data } = await request.$http.post(
      '/api/v1/official/agents',
      payload,
      {
        hideGenericErrorAlert: true,
      },
    );

    return {
      data,
    };
  },

  async toggleAgentAssignment({ agentUuid, is_assigned }) {
    const { data } = await request.$http.patch(
      `api/project/${projectUuid.value}/assign/${agentUuid}`,
      {
        assigned: is_assigned,
      },
      {
        hideGenericErrorAlert: true,
      },
    );

    return {
      data,
    };
  },

  async deleteAgent(uuid) {
    return await request.$http.delete(
      `api/project/${projectUuid.value}/agents/${uuid}`,
    );
  },
};
