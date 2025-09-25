import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import nexusaiAPI from '@/api/nexusaiAPI.js';

vi.mock('@/api/nexusaiAPI.js');

describe('AgentsTeamStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAgentsTeamStore();
  });

  describe('loadActiveTeam', () => {
    it('should load active team successfully', async () => {
      const mockData = {
        data: {
          agents: [],
          manager: {
            id: 'manager',
          },
        },
      };
      nexusaiAPI.router.agents_team.listActiveTeam.mockResolvedValue(mockData);

      await store.loadActiveTeam();

      expect(store.activeTeam.status).toBe('complete');
      expect(store.activeTeam.data).toEqual(mockData.data);
    });

    it('should handle errors when loading active team', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      nexusaiAPI.router.agents_team.listActiveTeam.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadActiveTeam();

      expect(store.activeTeam.status).toBe('error');
    });
  });

  describe('loadOfficialAgents', () => {
    it('should load official agents team successfully', async () => {
      const mockData = {
        data: [],
      };
      const listOfficialAgentsSpy =
        nexusaiAPI.router.agents_team.listOfficialAgents.mockResolvedValue(
          mockData,
        );

      await store.loadOfficialAgents({
        search: 'Test Search',
      });

      expect(store.officialAgents.status).toBe('complete');
      expect(store.officialAgents.data).toEqual(mockData.data);
      expect(listOfficialAgentsSpy).toHaveBeenCalledWith({
        search: 'Test Search',
      });
    });

    it('should handle errors when loading official agents', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      nexusaiAPI.router.agents_team.listOfficialAgents.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadOfficialAgents();

      expect(store.officialAgents.status).toBe('error');
    });
  });

  describe('loadMyAgents', () => {
    it('should load my agents team successfully', async () => {
      const mockData = {
        data: [],
      };
      const listMyAgentsSpy =
        nexusaiAPI.router.agents_team.listMyAgents.mockResolvedValue(mockData);

      await store.loadMyAgents({
        search: 'Test Search',
      });

      expect(store.myAgents.status).toBe('complete');
      expect(store.myAgents.data).toEqual(mockData.data);
      expect(listMyAgentsSpy).toHaveBeenCalledWith({
        search: 'Test Search',
      });
    });

    it('should handle errors when loading my agents', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      nexusaiAPI.router.agents_team.listMyAgents.mockRejectedValue(
        new Error('Error'),
      );

      await store.loadMyAgents();

      expect(store.myAgents.status).toBe('error');
    });
  });

  describe('toggleAgentAssignment', () => {
    it('should throws an error if uuid is missing', async () => {
      expect.assertions(1);
      try {
        await store.toggleAgentAssignment({ is_assigned: true });
      } catch (error) {
        expect(error.message).toBe('uuid and is_assigned are required');
      }
    });

    it('updates agent assignment correctly', async () => {
      const uuid = '123';
      const is_assigned = true;
      const agent = { uuid, assigned: true };
      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
        data: agent,
      });

      store.officialAgents.data.push(agent);

      await store.toggleAgentAssignment({ uuid, is_assigned });

      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).toHaveBeenCalledWith({
        agentUuid: uuid,
        is_assigned,
      });

      expect(store.officialAgents.data[0].assigned).toBe(true);

      store.officialAgents.data = [];
      store.myAgents.data.push(agent);

      await store.toggleAgentAssignment({ uuid, is_assigned });

      expect(store.myAgents.data[0].assigned).toBe(true);
    });

    it('should handle agent not found error when toggling assignment', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await store.toggleAgentAssignment({
        uuid: '456',
        is_assigned: true,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'error',
        new Error('Agent not found'),
      );
      expect(result.status).toBe('error');
    });

    it('should handle API error when toggling agent assignment', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const agent = { uuid: '123', assigned: true };
      store.officialAgents.data.push(agent);

      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockRejectedValue(
        new Error('API Error'),
      );

      const result = await store.toggleAgentAssignment({
        uuid: '456',
        is_assigned: true,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'error',
        new Error('Agent not found'),
      );
      expect(result.status).toBe('error');
    });
  });
});
