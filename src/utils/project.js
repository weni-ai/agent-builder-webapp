import { setProjectUuid } from '@/store/Project';

export async function getProjectUuid() {
  return new Promise((resolve) => {
    const eventHandler = (event) => {
      if (event.data.event === 'updateProjectUuid') {
        setProjectUuid(event.data.projectUuid);
        window.removeEventListener('message', eventHandler);
        return resolve();
      }
    };
    window.addEventListener('message', eventHandler);
    window.parent.postMessage({ event: 'getProjectUuid' }, '*');
  });
}

export function setupProjectUuidListener() {
  window.addEventListener('message', (event) => {
    if (event.data.event === 'updateProjectUuid') {
      setProjectUuid(event.data.projectUuid);
    }
  });
}
