import { describe, it, expect } from 'vitest';

import previewListeners from '../index.js';
import addLog from '../addLog.js';
import update from '../update.js';

describe('src/websocket/listeners/preview/index.js', () => {
  describe('Module exports', () => {
    it('exports addLog function', () => {
      expect(previewListeners.addLog).toBe(addLog);
    });

    it('exports update function', () => {
      expect(previewListeners.update).toBe(update);
    });

    it('exports all expected functions', () => {
      expect(Object.keys(previewListeners)).toEqual(['addLog', 'update']);
    });
  });
});
