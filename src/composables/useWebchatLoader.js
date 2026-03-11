import env from '@/utils/env';

let loadPromise = null;
let scriptElement = null;

function loadUmdBundle() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.WebChat) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = env('WWC_UMD_URL');
    script.async = true;
    script.onload = resolve;
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
    window.WebChat?.destroy();
    scriptElement?.remove();
    scriptElement = null;
    loadPromise = null;
  }

  return { preload, cleanup };
}
