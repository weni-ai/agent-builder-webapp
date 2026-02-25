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

      const timezone = Intl?.DateTimeFormat?.().resolvedOptions?.()?.timeZone;
      const isLegacy = source === 'legacy';

      let url = isLegacy
        ? `/api/${projectUuid}/conversations/?${new URLSearchParams(legacyParams)}`
        : `/api/v2/${projectUuid}/conversations/${uuid}`;

      if (next) {
        url = next.slice(next.indexOf('/api'));
      }

      if (!isLegacy && !url.includes('timezone')) {
        // Add timezone to url
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}${new URLSearchParams({ timezone }).toString()}`;
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
