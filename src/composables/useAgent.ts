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
      id: (agent as Agent).id || (agent as Agent).slug || '',
      name: agent.name || '',
      is_official: agent.is_official || false,
      about: 'about' in agent ? agent.about : null,
      description: agent.description || '',
      group: 'group' in agent ? (agent.group as string) : undefined,
      mcp:
        'mcp' in agent && agent.mcp
          ? {
              name: agent.mcp?.name || '',
              constants: agent.mcp?.constants || {},
              description:
                'description' in agent.mcp ? agent.mcp?.description : null,
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
