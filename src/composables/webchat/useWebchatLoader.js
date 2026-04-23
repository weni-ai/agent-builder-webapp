import env from '@/utils/env';

let loadPromise = null;
let scriptElement = null;
let webchatInstance = null;

function loadUmdBundle() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (webchatInstance) {
      resolve(webchatInstance);
      return;
    }

    const previousWebChat = window.WebChat;

    const script = document.createElement('script');
    script.src = env('WWC_UMD_URL');
    script.async = true;
    script.onload = () => {
      webchatInstance = window.WebChat;

      // Restore the global so other apps (e.g. connect host) keep their
      // reference to their own WebChat instance untouched.
      if (previousWebChat === undefined) {
        delete window.WebChat;
      } else {
        window.WebChat = previousWebChat;
      }

      resolve(webchatInstance);
    };
    script.onerror = (error) => {
      loadPromise = null;
      reject(error);
    };

    document.head.appendChild(script);
    scriptElement = script;
  });

  return loadPromise;
}

export function useWebchatLoader() {
  function preload() {
    return loadUmdBundle();
  }

  function cleanup() {
    webchatInstance?.destroy?.();
    webchatInstance = null;
    scriptElement?.remove();
    scriptElement = null;
    loadPromise = null;
  }

  function getInstance() {
    return webchatInstance;
  }

  return { preload, cleanup, getInstance };
}
