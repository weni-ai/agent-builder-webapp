import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { useWebchatPreviewStore } from '@/store/WebchatPreview';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      simulation: {
        setManagerModel: vi.fn().mockResolvedValue({}),
        endSession: vi.fn().mockResolvedValue({}),
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
  })),
}));

vi.mock('@/store/FlowPreview', () => ({
  useFlowPreviewStore: vi.fn(() => ({
    preview: {
      contact: {
        urn: 'test-contact-urn',
      },
    },
  })),
}));

describe('WebchatPreviewStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useWebchatPreviewStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete window.WebChat;
  });

  describe('changeManagerModel', () => {
    it('should call setManagerModel with projectUuid and managerId', async () => {
      await store.changeManagerModel('manager-123');

      expect(
        nexusaiAPI.agent_builder.simulation.setManagerModel,
      ).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        urn: 'test-contact-urn',
        managerFoundationModel: 'manager-123',
      });
    });
  });

  describe('endSession', () => {
    it('should call endSession API with projectUuid and contact urn', async () => {
      await store.endSession();

      expect(
        nexusaiAPI.agent_builder.simulation.endSession,
      ).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        urn: 'test-contact-urn',
      });
    });

    it('should call window.WebChat.clear when WebChat is available', async () => {
      window.WebChat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };

      await store.endSession();

      expect(window.WebChat.clear).toHaveBeenCalled();
    });

    it('should call window.WebChat.clearPageHistory when WebChat is available', async () => {
      window.WebChat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };

      await store.endSession();

      expect(window.WebChat.clearPageHistory).toHaveBeenCalled();
    });

    it('should call window.WebChat.clearCart when WebChat is available', async () => {
      window.WebChat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };

      await store.endSession();

      expect(window.WebChat.clearCart).toHaveBeenCalled();
    });

    it('should not throw when window.WebChat is undefined', async () => {
      delete window.WebChat;

      await expect(store.endSession()).resolves.not.toThrow();
    });

    it('should increment sessionVersion', async () => {
      expect(store.sessionVersion).toBe(0);

      await store.endSession();
      expect(store.sessionVersion).toBe(1);

      await store.endSession();
      expect(store.sessionVersion).toBe(2);
    });
  });
});
