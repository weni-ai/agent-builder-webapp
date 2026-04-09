import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useWebSocketHistoryPatch } from '../useWebSocketHistoryPatch';

describe('useWebSocketHistoryPatch', () => {
  let originalSend;

  beforeEach(() => {
    originalSend = WebSocket.prototype.send;
  });

  afterEach(() => {
    WebSocket.prototype.send = originalSend;
    vi.clearAllMocks();
  });

  describe('patch', () => {
    it('should replace WebSocket.prototype.send', () => {
      const { patch } = useWebSocketHistoryPatch();

      patch();

      expect(WebSocket.prototype.send).not.toBe(originalSend);
    });

    it('should intercept get_history messages and call onReady', async () => {
      const onReady = vi.fn();
      const { patch } = useWebSocketHistoryPatch();

      patch(onReady);

      const mockOnMessage = vi.fn();
      const fakeSocket = { onmessage: mockOnMessage };

      WebSocket.prototype.send.call(
        fakeSocket,
        JSON.stringify({ type: 'get_history' }),
      );

      await vi.waitFor(() => {
        expect(onReady).toHaveBeenCalled();
      });

      expect(mockOnMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: JSON.stringify({ type: 'history', history: [] }),
        }),
      );
    });

    it('should forward non-history messages to the original send', () => {
      const originalSendSpy = vi.fn();
      WebSocket.prototype.send = originalSendSpy;

      const { patch } = useWebSocketHistoryPatch();
      patch();

      const fakeSocket = {};
      const message = JSON.stringify({ type: 'message', text: 'hello' });

      WebSocket.prototype.send.call(fakeSocket, message);

      expect(originalSendSpy).toHaveBeenCalledWith(message);
    });

    it('should work without an onReady callback', async () => {
      vi.useFakeTimers();

      const { patch } = useWebSocketHistoryPatch();
      patch();

      const fakeSocket = { onmessage: vi.fn() };

      expect(() => {
        WebSocket.prototype.send.call(
          fakeSocket,
          JSON.stringify({ type: 'get_history' }),
        );
        vi.runAllTimers();
      }).not.toThrow();

      vi.useRealTimers();
    });
  });

  describe('restore', () => {
    it('should restore the original WebSocket.prototype.send', () => {
      const { patch, restore } = useWebSocketHistoryPatch();

      patch();
      expect(WebSocket.prototype.send).not.toBe(originalSend);

      restore();
      expect(WebSocket.prototype.send).toBe(originalSend);
    });

    it('should be safe to call restore without patching first', () => {
      const { restore } = useWebSocketHistoryPatch();

      expect(() => restore()).not.toThrow();
      expect(WebSocket.prototype.send).toBe(originalSend);
    });

    it('should be safe to call restore multiple times', () => {
      const { patch, restore } = useWebSocketHistoryPatch();

      patch();
      restore();
      restore();

      expect(WebSocket.prototype.send).toBe(originalSend);
    });
  });
});
