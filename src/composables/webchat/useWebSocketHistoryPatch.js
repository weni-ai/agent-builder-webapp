const EMPTY_HISTORY_RESPONSE = JSON.stringify({
  type: 'history',
  history: [],
});

export function useWebSocketHistoryPatch() {
  let originalWsSend = null;

  function patch(onReady) {
    originalWsSend = WebSocket.prototype.send;

    WebSocket.prototype.send = function (data) {
      const parsed = JSON.parse(data);

      if (parsed.type === 'get_history') {
        setTimeout(() => {
          this.onmessage?.(
            new MessageEvent('message', { data: EMPTY_HISTORY_RESPONSE }),
          );
          onReady?.();
        }, 0);
        return;
      }

      return originalWsSend.call(this, data);
    };
  }

  function restore() {
    if (originalWsSend) {
      WebSocket.prototype.send = originalWsSend;
      originalWsSend = null;
    }
  }

  return { patch, restore };
}
