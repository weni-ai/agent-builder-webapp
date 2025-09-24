import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import addLog from '../addLog.js';
import { usePreviewStore } from '@/store/Preview';

vi.mock('@/store/Preview', () => ({
  usePreviewStore: vi.fn(),
}));

describe('src/websocket/listeners/preview/addLog.js', () => {
  let mockPreviewStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    mockPreviewStore = {
      addLog: vi.fn(),
    };

    usePreviewStore.mockReturnValue(mockPreviewStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Log processing', () => {
    it('calls preview store addLog method with message', () => {
      const testMessage = {
        type: 'trace_update',
        data: { message: 'Test log message' },
        config: { category: 'knowledge', summary: 'Test summary' },
      };

      addLog(testMessage);

      expect(usePreviewStore).toHaveBeenCalled();
      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(testMessage);
      expect(mockPreviewStore.addLog).toHaveBeenCalledTimes(1);
    });

    it('handles empty message object', () => {
      const emptyMessage = {};

      addLog(emptyMessage);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(emptyMessage);
    });

    it('handles null message', () => {
      const nullMessage = null;

      addLog(nullMessage);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(nullMessage);
    });

    it('handles undefined message', () => {
      const undefinedMessage = undefined;

      addLog(undefinedMessage);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(undefinedMessage);
    });

    it('handles string message', () => {
      const stringMessage = 'Simple string message';

      addLog(stringMessage);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(stringMessage);
    });

    it('handles complex nested message object', () => {
      const complexMessage = {
        type: 'trace_update',
        data: {
          trace: {
            orchestrationTrace: {
              invocationInput: {
                agentCollaboratorInvocationInput: {
                  agentCollaboratorName: 'test-agent',
                },
              },
            },
          },
        },
        config: {
          agentName: 'test-agent',
          category: 'thinking',
          summary: 'Agent processing request',
          icon: 'brain',
        },
      };

      addLog(complexMessage);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(complexMessage);
    });
  });

  describe('Store integration', () => {
    it('uses preview store instance', () => {
      const message = { type: 'test' };

      addLog(message);

      expect(usePreviewStore).toHaveBeenCalled();
    });

    it('calls addLog method on store instance', () => {
      const message = { type: 'test', data: 'test data' };

      addLog(message);

      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(message);
    });
  });

  describe('Error handling', () => {
    it('handles store addLog method throwing error', () => {
      const errorMessage = 'Store error';
      mockPreviewStore.addLog.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const message = { type: 'test' };

      expect(() => addLog(message)).toThrow(errorMessage);
      expect(mockPreviewStore.addLog).toHaveBeenCalledWith(message);
    });
  });
});
