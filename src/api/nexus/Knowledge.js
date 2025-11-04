import request from '@/api/nexusaiRequest';
import forceHttps from '@/api/utils/forceHttps';
import { moduleLocalStorage } from '@/utils/storage';

const INLINE_CONTENT_BASE_ENDPOINTS = {
  TEXT: 'inline-content-base-text',
  LINK: 'inline-content-base-link',
  FILE: 'inline-content-base-file',
};

/**
 * Generate content base endpoint URL based on feature flag
 * @param {Object} params - Parameters for endpoint generation
 * @param {string} params.type - Endpoint type (TEXT, LINK, FILE)
 * @param {string} [params.itemUuid] - Item UUID (optional, for specific item operations)
 * @returns {string} Generated endpoint URL
 */
const generateContentBaseEndpoint = ({ type, itemUuid }) => {
  const projectUuid = moduleLocalStorage.getItem('projectUuid');

  let baseEndpoint;

  if (projectUuid) {
    const endpointName = INLINE_CONTENT_BASE_ENDPOINTS[type];
    baseEndpoint = `api/${projectUuid}/${endpointName}/`;
  }

  return itemUuid ? `${baseEndpoint}${itemUuid}/` : baseEndpoint;
};

export const Knowledge = {
  texts: {
    list() {
      const endpoint = generateContentBaseEndpoint({
        type: 'TEXT',
      });
      return request.$http.get(endpoint);
    },

    create({ text, hideGenericErrorAlert = false }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'TEXT',
      });
      return request.$http.post(
        endpoint,
        {
          text,
        },
        {
          routerName: 'contentBase-text-create',
          hideGenericErrorAlert,
        },
      );
    },

    edit({ contentBaseTextUuid, text, hideGenericErrorAlert = false }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'TEXT',
        itemUuid: contentBaseTextUuid,
      });
      return request.$http.put(
        endpoint,
        {
          text,
        },
        {
          routerName: 'contentBase-text-edit',
          hideGenericErrorAlert,
        },
      );
    },
  },

  sites: {
    create({ link }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'LINK',
      });
      return request.$http.post(endpoint, {
        link,
      });
    },

    list({ next }) {
      if (next) {
        return request.$http.get(forceHttps(next));
      }

      const endpoint = generateContentBaseEndpoint({
        type: 'LINK',
      });
      return request.$http.get(endpoint);
    },

    read({ uuid }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'LINK',
        itemUuid: uuid,
      });
      return request.$http.get(endpoint);
    },

    delete({ linkUuid }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'LINK',
        itemUuid: linkUuid,
      });
      return request.$http.delete(endpoint);
    },
  },

  files: {
    create({ file, extension_file, onUploadProgress }) {
      const form = new FormData();
      const fileName =
        file.name.lastIndexOf('.') === -1
          ? file.name
          : file.name.slice(0, file.name.lastIndexOf('.')).replace(/\./g, ' ') +
            file.name.slice(file.name.lastIndexOf('.'));

      form.append('file', file, fileName);
      form.append('extension_file', extension_file);
      form.append('load_type', 'pdfminer');

      const endpoint = generateContentBaseEndpoint({
        type: 'FILE',
      });
      return request.$http.post(endpoint, form, {
        onUploadProgress,
      });
    },

    list({ next }) {
      if (next) {
        return request.$http.get(forceHttps(next));
      }

      const endpoint = generateContentBaseEndpoint({
        type: 'FILE',
      });
      return request.$http.get(endpoint);
    },

    read({ uuid }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'FILE',
        itemUuid: uuid,
      });
      return request.$http.get(endpoint);
    },

    delete({ fileUuid }) {
      const endpoint = generateContentBaseEndpoint({
        type: 'FILE',
        itemUuid: fileUuid,
      });
      return request.$http.delete(endpoint);
    },

    download({ fileUuid, file_name }) {
      return request.$http.post('api/v1/download-file', {
        file_name,
        content_base_file: fileUuid,
      });
    },
  },
};
