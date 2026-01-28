import { computed } from 'vue';
import request from '@/api/nexusaiRequest';
import { useProjectStore } from '@/store/Project';
import { cleanParams } from '@/utils/http';

const projectUuid = computed(() => useProjectStore().uuid);

function filterSystems(systems) {
  return systems.filter(
    (system) => system !== 'no_system' && system !== 'custom',
  );
}

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

    return [...data.new.agents, ...data.legacy].map((agent) => ({
      ...agent,
      id: agent.slug,
      systems: filterSystems(agent.systems),
    }));
  },

  async getOfficialAgentDetails(group) {
    const params = {
      project_uuid: projectUuid.value,
    };

    const { data } = await request.$http.get(
      `/api/v1/official/agents/${group}`,
      {
        params,
      },
    );

    return {
      ...data,
      systems: filterSystems(data.systems),
    };
  },

  async toggleOfficialAgentAssignment(payload) {
    const { data } = await request.$http.post(
      `/api/v1/official/agents?project_uuid=${projectUuid.value}&agent_uuid=${payload.agent_uuid}`,
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
            slug,
            mcp,
          }) => ({
            uuid,
            name,
            skills,
            id: id || slug,
            description,
            credentials,
            is_official,
            mcp,
          }),
        ),
      },
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
