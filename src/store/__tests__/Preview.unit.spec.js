import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { usePreviewStore } from '@/store/Preview';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useUserStore } from '@/store/User';
import { useProjectStore } from '@/store/Project';
import WS from '@/websocket/setup';
import { processLog } from '@/utils/previewLogs';

vi.mock('@/websocket/setup');
vi.mock('@/store/AgentsTeam', () => ({
  useAgentsTeamStore: vi.fn(),
}));
vi.mock('@/store/User', () => ({
  useUserStore: vi.fn(),
}));
vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(),
}));

describe('PreviewStore', () => {
  let store;
  let mockAgentsTeamStore;
  let mockUserStore;
  let mockProjectStore;
  let mockWsInstance;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockAgentsTeamStore = {
      activeTeam: {
        data: {
          agents: [
            { id: 'agent-1', name: 'Agent 1' },
            { id: 'agent-2', name: 'Agent 2' },
          ],
          manager: { id: 'manager', name: 'Manager' },
        },
      },
    };

    mockUserStore = {
      user: {
        token: 'test-token',
      },
    };

    mockProjectStore = {
      uuid: 'test-project-uuid',
    };

    mockWsInstance = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    WS.mockImplementation(() => mockWsInstance);
    useAgentsTeamStore.mockReturnValue(mockAgentsTeamStore);
    useUserStore.mockReturnValue(mockUserStore);
    useProjectStore.mockReturnValue(mockProjectStore);
    store = usePreviewStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should have initial state properties', () => {
      expect(store.ws).toBeNull();
      expect(store.logs).toEqual([]);
      expect(store.collaboratorsLogs).toEqual([]);
    });
  });

  describe('Computed properties', () => {
    it('should filter and map collaborators traces correctly', () => {
      store.logs = [
        { type: 'trace_update', trace: { id: 1 } },
        { type: 'other_type', trace: { id: 2 } },
        { type: 'trace_update', trace: { id: 3 } },
      ];

      expect(store.collaboratorsLogs).toEqual([store.logs[0], store.logs[2]]);
    });

    it('should return the active agent based on the last trace', () => {
      store.logs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'agent-1',
            summary: 'Task 1',
          },
        },
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'agent-2',
            summary: 'Task 2',
          },
        },
      ];

      expect(store.activeAgent).toEqual({
        ...mockAgentsTeamStore.activeTeam.data.agents[1],
        currentTask: 'Task 2',
      });
    });

    it('should return only the task info when agent not found', () => {
      store.logs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'unknown-agent',
            summary: 'Task X',
          },
        },
      ];
      expect(store.activeAgent).toEqual({
        currentTask: 'Task X',
      });
    });
  });

  describe('Actions', () => {
    it('should add a log', () => {
      const log = {
        type: 'trace_update',
        trace: {
          trace: {
            orchestrationTrace: {
              invocationInput: {
                agentCollaboratorInvocationInput: {
                  agentCollaboratorName: 'agent-1',
                },
              },
            },
          },
        },
      };
      store.addLog(log);
      const processedLog = processLog({ log, currentAgent: 'agent-1' });

      expect(store.logs).toEqual([processedLog]);
    });

    it('should clear logs', () => {
      store.logs = [
        { type: 'trace_update', data: { id: 1 } },
        { type: 'trace_update', data: { id: 2 } },
      ];

      store.clearLogs();

      expect(store.logs).toEqual([]);
    });

    it('should connect to WebSocket', () => {
      store.connectWS();

      expect(WS).toHaveBeenCalledWith({
        project: 'test-project-uuid',
        token: 'test-token',
        endpoint: 'preview',
      });

      expect(mockWsInstance.connect).toHaveBeenCalled();

      expect(store.ws).toStrictEqual(mockWsInstance);
    });

    it('should not create a new WebSocket if one already exists', () => {
      store.ws = mockWsInstance;

      store.connectWS();

      expect(WS).toHaveBeenCalledTimes(0);
    });

    it('should disconnect from WebSocket', () => {
      store.ws = mockWsInstance;

      store.disconnectWS();

      expect(mockWsInstance.disconnect).toHaveBeenCalled();

      expect(store.ws).toBeNull();
    });

    it('should not try to disconnect if no WebSocket exists', () => {
      store.ws = null;

      store.disconnectWS();

      expect(mockWsInstance.disconnect).not.toHaveBeenCalled();
    });
  });
});
