import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { usePreviewStore } from '@/store/Preview';
import { useUserStore } from '@/store/User';
import { useProjectStore } from '@/store/Project';
import WS from '@/websocket/setup';
import { processLog } from '@/utils/previewLogs';

vi.mock('@/websocket/setup');
vi.mock('@/store/User', () => ({
  useUserStore: vi.fn(),
}));
vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(),
}));

describe('PreviewStore', () => {
  let store;
  let mockUserStore;
  let mockProjectStore;
  let mockWsInstance;

  beforeEach(() => {
    setActivePinia(createPinia());

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

    it('should expose the active agent name and current task from the last trace', () => {
      store.logs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'Concierge',
            summary: 'Task 1',
          },
        },
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'Reservations',
            summary: 'Task 2',
          },
        },
      ];

      expect(store.activeAgent).toEqual({
        name: 'Reservations',
        currentTask: 'Task 2',
      });
    });

    it('should normalize "manager" agentName to "Manager"', () => {
      store.logs = [
        {
          type: 'trace_update',
          data: null,
          config: {
            agentName: 'manager',
            summary: 'Thinking',
          },
        },
      ];

      expect(store.activeAgent).toEqual({
        name: 'Manager',
        currentTask: 'Thinking',
      });
    });

    it('should return undefined name and currentTask when there are no logs', () => {
      expect(store.activeAgent).toEqual({
        name: undefined,
        currentTask: undefined,
      });
    });
  });

  describe('Actions', () => {
    it('should add a trace_update log going through processLog', () => {
      const log = {
        type: 'trace_update',
        trace: {
          trace: {
            orchestrationTrace: {
              rationale: { text: 'Thinking' },
            },
          },
          config: { agentName: 'manager' },
        },
      };
      store.addLog(log);

      expect(store.logs).toEqual([processLog({ log })]);
    });

    it('should add non-trace_update logs as-is', () => {
      const log = { type: 'message', text: 'hi' };
      store.addLog(log);

      expect(store.logs).toEqual([log]);
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
        path: 'test-project-uuid/simulation',
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
