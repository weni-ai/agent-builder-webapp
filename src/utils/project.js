import { moduleStorage } from '@/utils/storage';

export async function getProjectUuid() {
  return new Promise((resolve) => {
    const eventHandler = (event) => {
      if (event.data.event === 'updateProjectUuid') {
        moduleStorage.setItem('projectUuid', event.data.projectUuid);
        window.removeEventListener('message', eventHandler);
        return resolve();
      }
    };
    window.addEventListener('message', eventHandler);
    window.parent.postMessage({ event: 'getProjectUuid' }, '*');
  });
}
