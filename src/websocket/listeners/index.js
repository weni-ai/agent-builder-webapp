import previewListener from './preview';

export default ({ ws, type = 'preview' }) => {
  const createListener = (callback) => (payload) => callback(payload);
  const createTypedListener = (expectedType, handler) => (message) => {
    if (message.type === expectedType) {
      handler(message);
    }
  };

  if (type === 'preview') {
    ws.on('trace_update', createListener(previewListener.addLog));
    ws.on('preview', createTypedListener('preview', previewListener.update));
  }
};
