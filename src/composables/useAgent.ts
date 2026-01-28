import { Agent, AgentGroup, ActiveTeamAgent } from '@/store/types/Agents.types';
import agentIconService from '@/utils/agentIconService';
import useAgentSystems from './useAgentSystems';

export default function useAgent() {
  const { getSystemObject } = useAgentSystems();
  function normalizeActiveAgent(agent: AgentGroup | Agent): ActiveTeamAgent {
    const systemName =
      'systems' in agent
        ? (agent as AgentGroup).systems[0]
        : agent.mcp?.system?.name;

    return {
      uuid: (agent as Agent).uuid || '',
      id: (agent as Agent).slug || '',
      name: agent.name || '',
      is_official: agent.is_official || false,
      description: agent.description || '',
      mcp:
        'mcp' in agent && agent.mcp
          ? {
              name: agent.mcp?.name || '',
              config: agent.mcp?.config || {},
              description: agent.mcp?.description || '',
              system: getSystemObject(systemName),
            }
          : null,
      icon: agentIconService.getIconForAgent(agent),
    };
  }

  return {
    normalizeActiveAgent,
  };
}
