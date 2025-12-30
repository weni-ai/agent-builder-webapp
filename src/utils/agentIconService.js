import Manager from '@/assets/images/icons/agents/Manager.svg';
import OrdersIcon1 from '@/assets/images/icons/agents/OrdersIcon1.svg';
import OrdersIcon2 from '@/assets/images/icons/agents/OrdersIcon2.svg';
import OrdersIcon3 from '@/assets/images/icons/agents/OrdersIcon3.svg';
import OrdersIcon4 from '@/assets/images/icons/agents/OrdersIcon4.svg';
import OrdersIcon5 from '@/assets/images/icons/agents/OrdersIcon5.svg';
import ExchangeIcon1 from '@/assets/images/icons/agents/ExchangeIcon1.svg';
import OrderCancelation from '@/assets/images/icons/agents/OrderCancelation.svg';
import Concierge from '@/assets/images/icons/agents/Concierge.svg';
import CustomIcon1 from '@/assets/images/icons/agents/CustomIcon1.svg';
import CustomIcon2 from '@/assets/images/icons/agents/CustomIcon2.svg';
import CustomIcon3 from '@/assets/images/icons/agents/CustomIcon3.svg';
import CustomIcon4 from '@/assets/images/icons/agents/CustomIcon4.svg';
import CustomIcon5 from '@/assets/images/icons/agents/CustomIcon5.svg';
import CustomIcon6 from '@/assets/images/icons/agents/CustomIcon6.svg';
import CustomIcon7 from '@/assets/images/icons/agents/CustomIcon7.svg';
import CustomIcon8 from '@/assets/images/icons/agents/CustomIcon8.svg';
import CustomIcon9 from '@/assets/images/icons/agents/CustomIcon9.svg';
import CustomIcon10 from '@/assets/images/icons/agents/CustomIcon10.svg';
import CustomIcon11 from '@/assets/images/icons/agents/CustomIcon11.svg';
import CustomIcon12 from '@/assets/images/icons/agents/CustomIcon12.svg';
import CustomIcon13 from '@/assets/images/icons/agents/CustomIcon13.svg';
import CustomIcon14 from '@/assets/images/icons/agents/CustomIcon14.svg';
import CustomIcon15 from '@/assets/images/icons/agents/CustomIcon15.svg';
import CustomIcon16 from '@/assets/images/icons/agents/CustomIcon16.svg';
import CustomIcon17 from '@/assets/images/icons/agents/CustomIcon17.svg';
import CustomIcon18 from '@/assets/images/icons/agents/CustomIcon18.svg';
import CustomIcon19 from '@/assets/images/icons/agents/CustomIcon19.svg';
import CustomIcon20 from '@/assets/images/icons/agents/CustomIcon20.svg';
import CustomIcon21 from '@/assets/images/icons/agents/CustomIcon21.svg';
import CustomIcon22 from '@/assets/images/icons/agents/CustomIcon22.svg';
import CustomIcon23 from '@/assets/images/icons/agents/CustomIcon23.svg';
import CustomIcon24 from '@/assets/images/icons/agents/CustomIcon24.svg';

export const agentIcons = {
  Manager,
  OrdersIcon1,
  OrdersIcon2,
  OrdersIcon3,
  OrdersIcon4,
  OrdersIcon5,
  ExchangeIcon1,
  OrderCancelation,
  Concierge,
  CustomIcon1,
  CustomIcon2,
  CustomIcon3,
  CustomIcon4,
  CustomIcon5,
  CustomIcon6,
  CustomIcon7,
  CustomIcon8,
  CustomIcon9,
  CustomIcon10,
  CustomIcon11,
  CustomIcon12,
  CustomIcon13,
  CustomIcon14,
  CustomIcon15,
  CustomIcon16,
  CustomIcon17,
  CustomIcon18,
  CustomIcon19,
  CustomIcon20,
  CustomIcon21,
  CustomIcon22,
  CustomIcon23,
  CustomIcon24,
};

const categories = {
  MANAGER: 'manager',
  EXCHANGE: 'exchange',
  CANCELLATION: 'cancellation',
  ORDERS: 'orders',
  CUSTOM: 'custom',
  CONCIERGE: 'concierge',
};

const categoryMatchers = {
  [categories.MANAGER]: (agent) => agent.id === 'manager',
  [categories.EXCHANGE]: (agent) => agent.name?.includes('Exchange'),
  [categories.CANCELLATION]: (agent) =>
    agent.name?.includes('Order Cancellation'),
  [categories.ORDERS]: (agent) => agent.name?.includes('Order'),
  [categories.CONCIERGE]: (agent) => agent.name?.includes('Concierge'),
};

const categoryIconMap = {
  [categories.MANAGER]: 'Manager',
  [categories.EXCHANGE]: 'ExchangeIcon1',
  [categories.CANCELLATION]: 'OrderCancelation',
  [categories.CONCIERGE]: 'Concierge',
};

const agentIconService = {
  iconAssignments: {
    [categories.ORDERS]: new Map(),
    [categories.CUSTOM]: new Map(),
  },

  nextIconIndex: {
    [categories.ORDERS]: 0,
    [categories.CUSTOM]: 0,
  },

  availableIcons: {
    [categories.ORDERS]: Array.from(
      { length: 5 },
      (_, i) => `OrdersIcon${i + 1}`,
    ),
    [categories.CUSTOM]: Array.from(
      { length: 24 },
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

    const { uuid } = agent;
    const category = this.getAgentCategory(agent);

    if (categoryIconMap[category]) {
      return categoryIconMap[category];
    }

    const assignments = this.iconAssignments[category];
    if (assignments?.has(uuid)) {
      return assignments.get(uuid);
    }

    if (this.availableIcons[category]) {
      const icons = this.availableIcons[category];
      const nextIndex = this.nextIconIndex[category];
      const iconId = icons[nextIndex];

      this.nextIconIndex[category] = (nextIndex + 1) % icons.length;
      assignments.set(uuid, iconId);
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
