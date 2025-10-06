import { moduleStorage } from '@/utils/storage';

export async function getJwtToken() {
  return new Promise((resolve) => {
    const eventHandler = (event) => {
      if (event.data.event === 'updateToken') {
        moduleStorage.setItem('authToken', event.data.token);
        window.removeEventListener('message', eventHandler);
        return resolve();
      }
    };
    window.addEventListener('message', eventHandler);
    window.parent.postMessage({ event: 'getToken' }, '*');
  });
}
