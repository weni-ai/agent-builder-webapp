import request from '@/api/nexusaiRequest';
import { AgentsTeam } from './nexus/AgentsTeam';
import { Supervisor } from './nexus/Supervisor';
import { Instructions } from './nexus/Instructions';
import { Knowledge } from './nexus/Knowledge';

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

      manager: {
        read() {
          // TODO: Remove this mock response when the API is implemented
          const managerSelectorMockResponse = {
            currentManager: 'manager-2.5',
            managers: {
              new: {
                id: 'manager-2.6',
                label: 'Manager 2.6',
              },
              legacy: {
                id: 'manager-2.5',
                label: 'Manager 2.5',
                deprecation: '2026-04-15',
              },
            },
            serverTime: '2026-01-08T13:00:00Z',
          };

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: JSON.parse(JSON.stringify(managerSelectorMockResponse)),
              });
            }, 1000);
          });
        },
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

  knowledge: Knowledge,
};
