import request from '@/api/nexusaiRequest';
import forceHttps from '@/api/utils/forceHttps';
import { moduleStorage } from '@/utils/storage';

const CONTENT_BASE_ENDPOINTS = {
  TEXT: 'content-bases-text',
  LINK: 'content-bases-link',
  FILE: 'content-bases-file',
};

const INLINE_CONTENT_BASE_ENDPOINTS = {
  TEXT: 'inline-content-base-text',
  LINK: 'inline-content-base-link',
  FILE: 'inline-content-base-file',
};

/**
 * Generate content base endpoint URL based on feature flag
 * @param {Object} params - Parameters for endpoint generation
 * @param {string} params.contentBaseUuid - Content base UUID (legacy)
 * @param {string} params.type - Endpoint type (TEXT, LINK, FILE)
 * @param {string} [params.itemUuid] - Item UUID (optional, for specific item operations)
 * @returns {string} Generated endpoint URL
 */
const generateContentBaseEndpoint = ({ contentBaseUuid, type, itemUuid }) => {
  const useAgentsTeam = true; // TODO: Remove this after refactoring
  const projectUuid = moduleStorage.getItem('projectUuid');

  let baseEndpoint;

  if (useAgentsTeam && projectUuid) {
    const endpointName = INLINE_CONTENT_BASE_ENDPOINTS[type];
    baseEndpoint = `api/${projectUuid}/${endpointName}/`;
  } else {
    const endpointName = CONTENT_BASE_ENDPOINTS[type];
    baseEndpoint = `api/${contentBaseUuid}/${endpointName}/`;
  }

  return itemUuid ? `${baseEndpoint}${itemUuid}/` : baseEndpoint;
};

export const ContentBases = {
  texts: {
    list({ contentBaseUuid }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'TEXT',
      });
      return request.$http.get(endpoint);
    },

    create({ contentBaseUuid, text, hideGenericErrorAlert = false }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
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

    edit({
      contentBaseUuid,
      contentBaseTextUuid,
      text,
      hideGenericErrorAlert = false,
    }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
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
    create({ contentBaseUuid, link }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'LINK',
      });
      return request.$http.post(endpoint, {
        link,
      });
    },

    list({ next, contentBaseUuid }) {
      if (next) {
        return request.$http.get(forceHttps(next));
      }

      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'LINK',
      });
      return request.$http.get(endpoint);
    },

    read({ contentBaseUuid, uuid }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'LINK',
        itemUuid: uuid,
      });
      return request.$http.get(endpoint);
    },

    delete({ contentBaseUuid, linkUuid }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'LINK',
        itemUuid: linkUuid,
      });
      return request.$http.delete(endpoint);
    },
  },

  files: {
    create({ contentBaseUuid, file, extension_file, onUploadProgress }) {
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
        contentBaseUuid,
        type: 'FILE',
      });
      return request.$http.post(endpoint, form, {
        onUploadProgress,
      });
    },

    list({ next, contentBaseUuid }) {
      if (next) {
        return request.$http.get(forceHttps(next));
      }

      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'FILE',
      });
      return request.$http.get(endpoint);
    },

    read({ contentBaseUuid, uuid }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
        type: 'FILE',
        itemUuid: uuid,
      });
      return request.$http.get(endpoint);
    },

    delete({ contentBaseUuid, fileUuid }) {
      const endpoint = generateContentBaseEndpoint({
        contentBaseUuid,
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

    preview({ projectUuid, contentBaseUuid, fileUuid, page }) {
      return request.$http.post(`api/${projectUuid}/document-preview/`, {
        content_base_uuid: contentBaseUuid,
        content_base_file_uuid: fileUuid,
        page_number: page,
      });
    },
  },
};
