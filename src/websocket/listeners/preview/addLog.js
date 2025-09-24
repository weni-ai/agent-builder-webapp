import { usePreviewStore } from '@/store/Preview';

export default (message) => {
  const previewStore = usePreviewStore();

  previewStore.addLog(message);
};
