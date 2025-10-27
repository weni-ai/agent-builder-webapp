import i18n from './plugins/i18n';

export function setupLanguageListener() {
  return new Promise((resolve) => {
    window.addEventListener('message', (event) => {
      if (event.data.event === 'setLanguage') {
        i18n.global.locale = event.data.language;
        resolve();
      }
    });
    window.parent.postMessage({ event: 'getLanguage' }, '*');
  });
}
