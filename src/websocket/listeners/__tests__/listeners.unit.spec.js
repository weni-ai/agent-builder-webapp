import { vi, describe, it, expect, beforeEach } from 'vitest';
import setupListeners from '../index';
import previewListener from '../preview';

vi.mock('../preview', () => ({
  default: {
    addLog: vi.fn(),
    update: vi.fn(),
  },
}));

describe('setupListeners', () => {
  let ws;

  beforeEach(() => {
    ws = {
      on: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe('Preview type listeners', () => {
    it('should register "trace_update" and "preview" event listeners for preview type', () => {
      setupListeners({ ws, type: 'preview' });

      expect(ws.on).toHaveBeenCalledWith('trace_update', expect.any(Function));
      expect(ws.on).toHaveBeenCalledWith('preview', expect.any(Function));
    });

    it('should call previewListener.addLog when trace_update event is triggered', () => {
      setupListeners({ ws, type: 'preview' });

      const traceUpdateCallback = ws.on.mock.calls.find(
        (call) => call[0] === 'trace_update',
      )[1];
      const payload = { data: 'trace-data' };

      traceUpdateCallback(payload);

      expect(previewListener.addLog).toHaveBeenCalledWith(payload);
    });

    it('should call previewListener.update when preview event with correct type is triggered', () => {
      setupListeners({ ws, type: 'preview' });

      const previewCallback = ws.on.mock.calls.find(
        (call) => call[0] === 'preview',
      )[1];
      const message = { type: 'preview', content: 'preview-content' };

      previewCallback(message);

      expect(previewListener.update).toHaveBeenCalledWith(message);
    });

    it('should not call previewListener.update when preview event has incorrect type', () => {
      setupListeners({ ws, type: 'preview' });

      const previewCallback = ws.on.mock.calls.find(
        (call) => call[0] === 'preview',
      )[1];
      const message = { type: 'different-type', content: 'preview-content' };

      previewCallback(message);

      expect(previewListener.update).not.toHaveBeenCalled();
    });
  });

  describe('Listener helper functions', () => {
    it('should create a simple listener that calls callback with payload', () => {
      setupListeners({ ws, type: 'preview' });

      const callback = ws.on.mock.calls[0][1];
      const payload = { test: 'data' };

      callback(payload);

      expect(previewListener.addLog).toHaveBeenCalledWith(payload);
    });
  });
});
