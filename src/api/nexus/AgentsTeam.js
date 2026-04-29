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

function normalizeMCPs(MCPs = []) {
  return MCPs.map(({ config, ...mcp }) => ({
    ...mcp,
    constants: config ?? [],
  }));
}

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

    const agents = [...data.new.agents, ...data.legacy].map((agent) => ({
      ...agent,
      id: agent.slug,
      systems: filterSystems(agent.systems),
      MCPs: normalizeMCPs(agent.MCPs),
    }));

    return {
      agents,
      availableSystems: data?.new?.available_systems,
    };
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
      MCPs: normalizeMCPs(data.MCPs),
    };
  },

  async toggleOfficialAgentAssignment(payload) {
    const agentId = payload.group
      ? `&group=${payload.group}`
      : `&agent_uuid=${payload.agent_uuid}`;

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
      data: data.map(
        ({
          uuid,
          name,
          about,
          description,
          skills,
          assigned,
          slug,
          mcp_definitions,
        }) => ({
          uuid,
          name,
          about: about ?? null,
          description,
          skills,
          assigned,
          credentials: mcp_definitions?.credentials ?? [],
          is_official: false,
          id: slug,
          constants: mcp_definitions?.config ?? [],
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
            about,
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
            about: about ?? null,
            description,
            credentials,
            is_official,
            mcp,
          }),
        ),
      },
    };
  },

  async toggleAgentAssignment({
    agentUuid,
    is_assigned,
    mcp_config,
    credentials,
  }) {
    const body = { assigned: is_assigned };
    if (mcp_config !== undefined) body.mcp_config = mcp_config;
    if (credentials !== undefined) body.credentials = credentials;

    const { data } = await request.$http.patch(
      `api/project/${projectUuid.value}/assign/${agentUuid}`,
      body,
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
