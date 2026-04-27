import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/env', () => ({
  default: vi.fn((key) => {
    if (key === 'WWC_UMD_URL') return 'https://cdn.example.com/webchat.umd.js';
    return undefined;
  }),
}));

describe('useWebchatLoader', () => {
  let originalWebChat;
  let appendChildSpy;
  let createdScripts;

  beforeEach(async () => {
    originalWebChat = window.WebChat;
    delete window.WebChat;

    createdScripts = [];

    appendChildSpy = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((script) => {
        createdScripts.push(script);
        setTimeout(() => script.onload?.(), 0);
        return script;
      });

    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalWebChat) {
      window.WebChat = originalWebChat;
    } else {
      delete window.WebChat;
    }

    appendChildSpy?.mockRestore();
    createdScripts = [];

    vi.clearAllMocks();
  });

  describe('preload', () => {
    it('creates a script element with correct src', async () => {
      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload } = useWebchatLoader();

      await preload();

      expect(appendChildSpy).toHaveBeenCalled();
      const script = createdScripts[0];
      expect(script.src).toBe('https://cdn.example.com/webchat.umd.js');
      expect(script.async).toBe(true);
    });

    it('resolves immediately if WebChat is already loaded', async () => {
      window.WebChat = { destroy: vi.fn() };

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload } = useWebchatLoader();

      await preload();

      expect(appendChildSpy).not.toHaveBeenCalled();
    });

    it('returns cached promise on subsequent calls', async () => {
      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload } = useWebchatLoader();

      const promise1 = preload();
      const promise2 = preload();

      expect(promise1).toBe(promise2);

      await promise1;
    });

    it('rejects when script fails to load', async () => {
      appendChildSpy.mockImplementation((script) => {
        createdScripts.push(script);
        setTimeout(() => script.onerror?.(new Error('Load failed')), 0);
        return script;
      });

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload } = useWebchatLoader();

      await expect(preload()).rejects.toThrow();
    });

    it('allows retry after load failure', async () => {
      let callCount = 0;

      appendChildSpy.mockImplementation((script) => {
        createdScripts.push(script);
        callCount++;
        if (callCount === 1) {
          setTimeout(() => script.onerror?.(new Error('Load failed')), 0);
        } else {
          setTimeout(() => script.onload?.(), 0);
        }
        return script;
      });

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload } = useWebchatLoader();

      await expect(preload()).rejects.toThrow();
      await preload();

      expect(appendChildSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('calls WebChat.destroy if available', async () => {
      const destroyMock = vi.fn();
      window.WebChat = { destroy: destroyMock };

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { cleanup } = useWebchatLoader();

      cleanup();

      expect(destroyMock).toHaveBeenCalled();
    });

    it('does not throw if WebChat is not defined', async () => {
      delete window.WebChat;

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { cleanup } = useWebchatLoader();

      expect(() => cleanup()).not.toThrow();
    });

    it('removes script element if exists', async () => {
      const mockRemove = vi.fn();

      appendChildSpy.mockImplementation((script) => {
        script.remove = mockRemove;
        createdScripts.push(script);
        setTimeout(() => script.onload?.(), 0);
        return script;
      });

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload, cleanup } = useWebchatLoader();

      await preload();
      cleanup();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('resets state allowing new preload', async () => {
      const mockRemove = vi.fn();

      appendChildSpy.mockImplementation((script) => {
        script.remove = mockRemove;
        createdScripts.push(script);
        setTimeout(() => script.onload?.(), 0);
        return script;
      });

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload, cleanup } = useWebchatLoader();

      await preload();
      cleanup();
      await preload();

      expect(appendChildSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration', () => {
    it('full lifecycle: preload, use, cleanup', async () => {
      const mockRemove = vi.fn();
      const destroyMock = vi.fn();

      appendChildSpy.mockImplementation((script) => {
        script.remove = mockRemove;
        createdScripts.push(script);
        setTimeout(() => {
          window.WebChat = { destroy: destroyMock };
          script.onload?.();
        }, 0);
        return script;
      });

      const { useWebchatLoader } = await import('../useWebchatLoader');
      const { preload, cleanup } = useWebchatLoader();

      await preload();

      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(window.WebChat).toBeDefined();

      cleanup();

      expect(destroyMock).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
