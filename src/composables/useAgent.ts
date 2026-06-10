import { Agent } from '@/store/types/Agents.types';
import agentIconService from '@/utils/agentIconService';

export default function useAgent() {
  function normalizeActiveAgent(agent: Agent): Agent {
    return {
      ...agent,
      id: agent.id || agent.slug || '',
      icon: agentIconService.getIconForAgent(agent),
    };
  }

  return {
    normalizeActiveAgent,
  };
}
