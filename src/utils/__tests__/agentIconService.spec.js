import { describe, it, expect } from 'vitest';
import agentIconService from '../agentIconService';

const resetCustomAssignments = () => {
  agentIconService.iconAssignments.custom = new Map();
  agentIconService.nextIconIndex.custom = 0;
};

const resetOrdersAssignments = () => {
  agentIconService.iconAssignments.orders = new Map();
  agentIconService.nextIconIndex.orders = 0;
};

describe('agentIconService', () => {
  describe('getAgentCategory', () => {
    it('should categorize manager agents correctly', () => {
      const agent = { id: 'manager' };
      expect(agentIconService.getAgentCategory(agent)).toBe('manager');
    });

    it('should categorize exchange agents correctly', () => {
      const agent = { name: 'Exchange Agent' };
      expect(agentIconService.getAgentCategory(agent)).toBe('exchange');
    });

    it('should categorize order cancellation agents correctly', () => {
      const agent = { name: 'Order Cancellation Agent' };
      expect(agentIconService.getAgentCategory(agent)).toBe('cancellation');
    });

    it('should categorize order agents correctly', () => {
      const agent = { name: 'Order Processing Agent' };
      expect(agentIconService.getAgentCategory(agent)).toBe('orders');
    });

    it('should default to custom category when no match is found', () => {
      const agent = { name: 'Custom Agent' };
      expect(agentIconService.getAgentCategory(agent)).toBe('custom');
    });
  });

  describe('getIconForAgent', () => {
    it('should return null for null agent', () => {
      expect(agentIconService.getIconForAgent(null)).toBeNull();
    });

    it('should return Manager icon for manager agents', () => {
      const agent = { id: 'manager', uuid: 'manager-uuid' };
      expect(agentIconService.getIconForAgent(agent)).toBe('Manager');
    });

    it('should return ExchangeIcon1 for exchange agents', () => {
      const agent = { name: 'Exchange Agent', uuid: 'exchange-uuid' };
      expect(agentIconService.getIconForAgent(agent)).toBe('ExchangeIcon1');
    });

    it('should return OrderCancelation for order cancellation agents', () => {
      const agent = { name: 'Order Cancellation Agent', uuid: 'cancel-uuid' };
      expect(agentIconService.getIconForAgent(agent)).toBe('OrderCancelation');
    });

    it('should return rotating OrdersIcon for order agents', () => {
      const agent1 = { name: 'Order Agent 1', uuid: 'order-uuid-1' };
      const agent2 = { name: 'Order Agent 2', uuid: 'order-uuid-2' };

      resetOrdersAssignments();

      expect(agentIconService.getIconForAgent(agent1)).toBe('OrdersIcon1');
      expect(agentIconService.getIconForAgent(agent2)).toBe('OrdersIcon2');
    });

    it('should return rotating CustomIcon for custom agents', () => {
      const agent1 = { name: 'Custom Agent 1', uuid: 'custom-uuid-1' };
      const agent2 = { name: 'Custom Agent 2', uuid: 'custom-uuid-2' };

      resetCustomAssignments();

      expect(agentIconService.getIconForAgent(agent1)).toBe('CustomIcon1');
      expect(agentIconService.getIconForAgent(agent2)).toBe('CustomIcon2');
    });

    it('should always return the same icon for the same agent uuid', () => {
      const agent = { name: 'Custom Agent', uuid: 'consistent-uuid' };

      resetCustomAssignments();

      const firstIcon = agentIconService.getIconForAgent(agent);

      const dummyAgent = { name: 'Dummy Agent', uuid: 'dummy-uuid' };
      agentIconService.getIconForAgent(dummyAgent);

      expect(agentIconService.getIconForAgent(agent)).toBe(firstIcon);
    });

    it('should rotate through all available icons when there are more agents than icons', () => {
      resetCustomAssignments();

      const agents = Array.from({ length: 26 }, (_, i) => ({
        name: `Custom Agent ${i + 1}`,
        uuid: `custom-uuid-${i + 1}`,
      }));

      agents.forEach((agent) => agentIconService.getIconForAgent(agent));

      expect(agentIconService.getIconForAgent(agents[24])).toBe('CustomIcon1');
      expect(agentIconService.getIconForAgent(agents[25])).toBe('CustomIcon2');
    });
  });

  describe('applyIconToAgent', () => {
    it('should return null for null agent', () => {
      expect(agentIconService.applyIconToAgent(null)).toBeNull();
    });

    it('should add icon property to agent object', () => {
      const agent = { name: 'Test Agent', uuid: 'test-uuid' };
      const result = agentIconService.applyIconToAgent(agent);

      expect(result).toHaveProperty('icon');
      expect(result.name).toBe(agent.name);
      expect(result.uuid).toBe(agent.uuid);
    });

    it('should not modify the original agent object', () => {
      const agent = { name: 'Test Agent', uuid: 'test-uuid' };
      agentIconService.applyIconToAgent(agent);

      expect(agent).not.toHaveProperty('icon');
    });
  });

  describe('applyIconsToAgents', () => {
    it('should return empty array for null or empty agents array', () => {
      expect(agentIconService.applyIconsToAgents(null)).toEqual([]);
      expect(agentIconService.applyIconsToAgents([])).toEqual([]);
    });

    it('should apply icons to all agents in array', () => {
      const agents = [
        { name: 'Manager Agent', id: 'manager', uuid: 'manager-uuid' },
        { name: 'Exchange Agent', uuid: 'exchange-uuid' },
        { name: 'Custom Agent', uuid: 'custom-uuid' },
      ];

      const result = agentIconService.applyIconsToAgents(agents);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('icon', 'Manager');
      expect(result[1]).toHaveProperty('icon');
      expect(result[2]).toHaveProperty('icon');
    });

    it('should maintain original agent properties', () => {
      const agents = [
        { name: 'Test Agent', uuid: 'test-uuid', customProp: 'custom value' },
      ];

      const result = agentIconService.applyIconsToAgents(agents);

      expect(result[0]).toHaveProperty('name', 'Test Agent');
      expect(result[0]).toHaveProperty('uuid', 'test-uuid');
      expect(result[0]).toHaveProperty('customProp', 'custom value');
    });
  });
});
