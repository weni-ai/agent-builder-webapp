import nexusRequest from '../nexusaiRequest';
import { ConversationAdapter } from '../adapters/supervisor/conversation';

export const Supervisor = {
  conversations: {
    async list(filterData) {
      const {
        projectUuid,
        signal,
        hideGenericErrorAlert = false,
        filters = {},
      } = filterData;

      const params = ConversationAdapter.toApi({ ...filters });

      const config = { signal, hideGenericErrorAlert };

      const { data } = await nexusRequest.$http.get(
        `/api/${projectUuid}/supervisor/?${new URLSearchParams(params)}`,
        config,
      );

      return ConversationAdapter.fromApi(data);
    },

    async getById({ projectUuid, start, end, urn, next }) {
      const params = {
        start,
        end,
        contact_urn: urn,
      };

      let url = `/api/${projectUuid}/conversations/?${new URLSearchParams(params)}`;

      if (next) {
        url = next.slice(next.indexOf('/api'));
      }

      const { data } = await nexusRequest.$http.get(url);

      return data;
    },

    async getTopics({ projectUuid }) {
      const { data } = await nexusRequest.$http.get(
        `/api/${projectUuid}/topics/`,
      );
      return data;
    },

    async export({ projectUuid, token }) {
      const { data } = await nexusRequest.$http.post('/api/reports', {
        auth_token: token,
        project_uuid: projectUuid,
      });
      return data;
    },

    async getExportEmails({ projectUuid }) {
      const { data } = await nexusRequest.$http.get(
        `/api/reports?project_uuid=${projectUuid}`,
      );
      return data;
    },
  },
};
