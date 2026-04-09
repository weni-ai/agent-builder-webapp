import Manager from '@/assets/images/icons/agents/Manager.png';
import CustomIcon1 from '@/assets/images/icons/agents/CustomIcon1.png';
import CustomIcon2 from '@/assets/images/icons/agents/CustomIcon2.png';
import CustomIcon3 from '@/assets/images/icons/agents/CustomIcon3.png';
import CustomIcon4 from '@/assets/images/icons/agents/CustomIcon4.png';
import CustomIcon5 from '@/assets/images/icons/agents/CustomIcon5.png';
import CustomIcon6 from '@/assets/images/icons/agents/CustomIcon6.png';
import CustomIcon7 from '@/assets/images/icons/agents/CustomIcon7.png';

export const agentIcons = {
  Manager,
  CustomIcon1,
  CustomIcon2,
  CustomIcon3,
  CustomIcon4,
  CustomIcon5,
  CustomIcon6,
  CustomIcon7,
};

const categories = {
  MANAGER: 'manager',
  CUSTOM: 'custom',
};

const categoryMatchers = {
  [categories.MANAGER]: (agent) => agent.id === 'manager',
};

const categoryIconMap = {
  [categories.MANAGER]: 'Manager',
};

const agentIconService = {
  iconAssignments: {
    [categories.CUSTOM]: new Map(),
  },

  nextIconIndex: {
    [categories.CUSTOM]: 0,
  },

  availableIcons: {
    [categories.CUSTOM]: Array.from(
      { length: 7 },
      (_, i) => `CustomIcon${i + 1}`,
    ),
  },

  getAgentCategory(agent) {
    for (const [category, matcher] of Object.entries(categoryMatchers)) {
      if (matcher(agent)) {
        return category;
      }
    }
    return categories.CUSTOM;
  },

  getIconForAgent(agent) {
    if (!agent) return null;

    const agentId = agent.uuid || agent.group;
    const category = this.getAgentCategory(agent);

    if (categoryIconMap[category]) {
      return categoryIconMap[category];
    }

    const assignments = this.iconAssignments[category];
    if (assignments?.has(agentId)) {
      return assignments.get(agentId);
    }

    if (this.availableIcons[category]) {
      const icons = this.availableIcons[category];
      const nextIndex = this.nextIconIndex[category];
      const iconId = icons[nextIndex];

      this.nextIconIndex[category] = (nextIndex + 1) % icons.length;
      assignments.set(agentId, iconId);
      return iconId;
    }

    return 'CustomIcon1';
  },

  applyIconToAgent(agent) {
    if (!agent) return null;

    return {
      ...agent,
      icon: this.getIconForAgent(agent),
    };
  },

  applyIconsToAgents(agents) {
    return agents?.map((agent) => this.applyIconToAgent(agent)) || [];
  },
};

export default agentIconService;
