import nexusRequest from '../nexusaiRequest';
import { fetchConversationList } from '../adapters/supervisor/conversationSources';
import { ConversationMessageAdapter } from '../adapters/supervisor/conversationMessage';

export const Supervisor = {
  conversations: {
    async list(filterData) {
      return fetchConversationList(filterData);
    },

    async getById({ projectUuid, start, end, urn, next, source, uuid }) {
      const legacyParams = ConversationMessageAdapter.toApiLegacy({
        start,
        end,
        urn,
      });

      let url =
        source === 'legacy'
          ? `/api/${projectUuid}/conversations/?${new URLSearchParams(legacyParams)}`
          : `/api/v2/${projectUuid}/conversations/${uuid}`;

      if (next) {
        url = next.slice(next.indexOf('/api'));
      }

      const { data } = await nexusRequest.$http.get(url);

      return ConversationMessageAdapter.fromApi(data);
    },

    async getLogs({ projectUuid, messageId }) {
      const { data } = await nexusRequest.$http.get(
        `api/agents/traces/?project_uuid=${projectUuid}&log_id=${messageId}`,
      );

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
