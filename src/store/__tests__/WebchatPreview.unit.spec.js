import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { useWebchatPreviewStore } from '@/store/WebchatPreview';
import nexusaiAPI from '@/api/nexusaiAPI';
import { useWebchatLoader } from '@/composables/webchat/useWebchatLoader';

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

vi.mock('@/composables/webchat/useWebchatLoader', () => ({
  useWebchatLoader: vi.fn(),
}));

describe('WebchatPreviewStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useWebchatPreviewStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      useWebchatLoader.mockReturnValue({ getInstance: () => null });

      await store.endSession();

      expect(
        nexusaiAPI.agent_builder.simulation.endSession,
      ).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        urn: 'test-contact-urn',
      });
    });

    it('should call webchat.clear when instance is available', async () => {
      const webchat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };
      useWebchatLoader.mockReturnValue({ getInstance: () => webchat });

      await store.endSession();

      expect(webchat.clear).toHaveBeenCalled();
    });

    it('should call webchat.clearPageHistory when instance is available', async () => {
      const webchat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };
      useWebchatLoader.mockReturnValue({ getInstance: () => webchat });

      await store.endSession();

      expect(webchat.clearPageHistory).toHaveBeenCalled();
    });

    it('should call webchat.clearCart when instance is available', async () => {
      const webchat = {
        clear: vi.fn().mockResolvedValue(undefined),
        clearPageHistory: vi.fn().mockResolvedValue(undefined),
        clearCart: vi.fn().mockResolvedValue(undefined),
      };
      useWebchatLoader.mockReturnValue({ getInstance: () => webchat });

      await store.endSession();

      expect(webchat.clearCart).toHaveBeenCalled();
    });

    it('should not throw when webchat instance is null', async () => {
      useWebchatLoader.mockReturnValue({ getInstance: () => null });

      await expect(store.endSession()).resolves.not.toThrow();
    });

    it('should increment sessionVersion', async () => {
      useWebchatLoader.mockReturnValue({ getInstance: () => null });

      expect(store.sessionVersion).toBe(0);

      await store.endSession();
      expect(store.sessionVersion).toBe(1);

      await store.endSession();
      expect(store.sessionVersion).toBe(2);
    });
  });
});
