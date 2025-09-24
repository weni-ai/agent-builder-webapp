import request from '@/api/nexusaiRequest';
import forceHttps from '@/api/utils/forceHttps';
import { AgentsTeam } from './nexus/AgentsTeam';
import { Supervisor } from './nexus/Supervisor';
import { Instructions } from './nexus/Instructions';

import { ProgressiveFeedbackAdapter } from './adapters/tunings/progressiveFeedback';
import { ComponentsAdapter } from './adapters/tunings/components';
import { ProjectDetailsAdapter } from './adapters/tunings/projectDetails';
import i18n from '@/utils/plugins/i18n';

export default {
  agent_builder: {
    user: {
      read() {
        return request.$http.get(`api/users/details/`);
      },
    },
    supervisor: Supervisor,
    instructions: Instructions,
  },

  router: {
    read({ projectUuid, obstructiveErrorProducer }) {
      return request.$http.get(`api/${projectUuid}/router/`, {
        obstructiveErrorProducer,
      });
    },

    agents_team: AgentsTeam,

    tunings: {
      read({ projectUuid }) {
        return request.$http.get(`api/${projectUuid}/llm/`);
      },

      restoreDefault({ projectUuid }) {
        return request.$http.post(`api/${projectUuid}/llm-default/`);
      },

      edit({ projectUuid, values }) {
        const { model, ...others } = values;

        return request.$http.patch(
          `api/${projectUuid}/llm/`,
          {
            model,
            setup: others,
          },
          {
            routerName: 'brain-tunings-edit',
            hideGenericErrorAlert: true,
          },
        );
      },

      listCredentials({ projectUuid }) {
        return request.$http.get(`api/project/${projectUuid}/credentials`, {
          hideGenericErrorAlert: true,
        });
      },

      editCredentials({ projectUuid, credentials = {}, requestOptions = {} }) {
        return request.$http.patch(
          `api/project/${projectUuid}/credentials`,
          credentials,
          requestOptions,
        );
      },

      createCredentials({ projectUuid, credentials = {}, agent_uuid }) {
        return request.$http.post(`api/project/${projectUuid}/credentials`, {
          credentials,
          agent_uuid,
        });
      },

      async getProgressiveFeedback({ projectUuid }) {
        const response = await request.$http.get(
          `api/project/${projectUuid}/rationale`,
        );

        return ProgressiveFeedbackAdapter.fromApi(response.data);
      },

      editProgressiveFeedback({ projectUuid, data, requestOptions = {} }) {
        return request.$http.patch(
          `api/project/${projectUuid}/rationale`,
          ProgressiveFeedbackAdapter.toApi(data),
          requestOptions,
        );
      },

      async getComponents({ projectUuid }) {
        const response = await request.$http.get(
          `api/project/${projectUuid}/components`,
        );

        return ComponentsAdapter.fromApi(response.data);
      },

      editComponents({ projectUuid, data, requestOptions = {} }) {
        return request.$http.patch(
          `api/project/${projectUuid}/components`,
          ComponentsAdapter.toApi(data),
          requestOptions,
        );
      },

      historyChanges: {
        read({ projectUuid, pageSize = 10, page = 1, filter = '' }) {
          let url = `api/${projectUuid}/activities/?page=${page}&page_size=${pageSize}`;

          if (filter) url = url + `&model_group=${filter}`;

          return request.$http.get(url);
        },
      },

      multiAgents: {
        read({ projectUuid }) {
          return request.$http.get(`api/project/${projectUuid}/multi-agents`);
        },

        edit({ projectUuid, multi_agents }) {
          return request.$http.patch(
            `api/project/${projectUuid}/multi-agents`,
            {
              multi_agents,
            },
          );
        },
      },

      projectDetails: {
        async read({ projectUuid }) {
          const response = await request.$http.get(
            `api/${projectUuid}/ab-project-details`,
          );
          return ProjectDetailsAdapter.fromApi(response.data);
        },
      },
    },

    profile: {
      read({ projectUuid }) {
        return request.$http.get(`api/${projectUuid}/customization/`);
      },

      edit({ projectUuid, data }) {
        return request.$http.put(`api/${projectUuid}/customization/`, data, {
          routerName: 'brain-customization-edit',
          hideGenericErrorAlert: true,
        });
      },

      delete({ projectUuid, id }) {
        return request.$http.delete(
          `api/${projectUuid}/customization/?id=${id}`,
        );
      },
    },

    preview: {
      create({ projectUuid, text, attachments, contact_urn }) {
        return request.$http.post(`api/${projectUuid}/preview/`, {
          text,
          attachments,
          contact_urn,
          language: i18n.global.locale,
        });
      },
      uploadFile({ projectUuid, file }) {
        const formData = new FormData();
        formData.append('file', file);

        return request.$http.post(`api/${projectUuid}/upload-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      },
    },
  },

  intelligences: {
    contentBases: {
      texts: {
        list({ contentBaseUuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-text/`,
          );
        },

        create({ contentBaseUuid, text, hideGenericErrorAlert = false }) {
          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-text/`,
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
          return request.$http.put(
            `api/${contentBaseUuid}/content-bases-text/${contentBaseTextUuid}/`,
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
          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-link/`,
            {
              link,
            },
          );
        },

        list({ next, contentBaseUuid }) {
          if (next) {
            return request.$http.get(forceHttps(next));
          }

          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-link/`,
          );
        },

        read({ contentBaseUuid, uuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-link/${uuid}/`,
          );
        },

        delete({ contentBaseUuid, linkUuid }) {
          return request.$http.delete(
            `api/${contentBaseUuid}/content-bases-link/${linkUuid}/`,
          );
        },
      },

      files: {
        create({ contentBaseUuid, file, extension_file, onUploadProgress }) {
          const form = new FormData();
          const fileName =
            file.name.lastIndexOf('.') === -1
              ? file.name
              : file.name
                  .slice(0, file.name.lastIndexOf('.'))
                  .replace(/\./g, ' ') +
                file.name.slice(file.name.lastIndexOf('.'));

          form.append('file', file, fileName);
          form.append('extension_file', extension_file);
          form.append('load_type', 'pdfminer');

          return request.$http.post(
            `api/${contentBaseUuid}/content-bases-file/`,
            form,
            {
              onUploadProgress,
            },
          );
        },

        list({ next, contentBaseUuid }) {
          if (next) {
            return request.$http.get(forceHttps(next));
          }

          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-file/`,
          );
        },

        read({ contentBaseUuid, uuid }) {
          return request.$http.get(
            `api/${contentBaseUuid}/content-bases-file/${uuid}/`,
          );
        },

        delete({ contentBaseUuid, fileUuid }) {
          return request.$http.delete(
            `api/${contentBaseUuid}/content-bases-file/${fileUuid}/`,
          );
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
    },
  },
};
