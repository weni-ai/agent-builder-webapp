import nexusRequest from '../nexusaiRequest';
import conversationsRequest from '../conversationsRequest';
import { fetchConversationList } from '../adapters/supervisor/conversationSources';
import { ConversationMessageAdapter } from '../adapters/supervisor/conversationMessage';
import { ImprovementsAdapter } from '../adapters/supervisor/improvements';
import { AffectedConversationsAdapter } from '../adapters/supervisor/affectedConversations';
import { CustomAnalysisImprovementsAdapter } from '../adapters/supervisor/customAnalysisImprovements';

export const Supervisor = {
  conversations: {
    async list(filterData) {
      return fetchConversationList(filterData);
    },

    async getById({ projectUuid, next, uuid }) {
      const timezone = Intl?.DateTimeFormat?.().resolvedOptions?.()?.timeZone;

      let url = `/api/v2/${projectUuid}/conversations/${uuid}`;

      if (next) {
        url = next.slice(next.indexOf('/api'));
      }

      if (!url.includes('timezone')) {
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
  improvements: {
    async runAnalysis({ projectUuid }) {
      await conversationsRequest.$http.post(
        `/api/v1/projects/${projectUuid}/improvements/run/`,
      );
    },

    async getAnalysis({ projectUuid }) {
      const { data } = await conversationsRequest.$http.get(
        `/api/v1/projects/${projectUuid}/improvements/`,
      );

      return ImprovementsAdapter.fromApi(data);
    },

    async updateStatus({ projectUuid, improvementUuid, status }) {
      await conversationsRequest.$http.patch(
        `/api/v1/projects/${projectUuid}/improvements/${improvementUuid}/`,
        { status },
      );
    },

    async contactSupport({ projectUuid, improvementUuid, projectName, email }) {
      const { data } = await conversationsRequest.$http.post(
        `/api/v1/projects/${projectUuid}/improvements/open-support-ticket/`,
        {
          improvement_uuid: improvementUuid,
          project_name: projectName,
          email,
        },
      );

      return data;
    },

    async getById({ projectUuid, improvementUuid }) {
      const { data } = await conversationsRequest.$http.get(
        `/api/v1/projects/${projectUuid}/improvements/${improvementUuid}/`,
      );

      const detail = ImprovementsAdapter.fromDetailApi(data);

      if (!detail) {
        throw new Error('Invalid improvement detail response');
      }

      return detail;
    },

    async getAffectedConversations({
      projectUuid,
      improvementUuid,
      page = 1,
      pageSize = 10,
    }) {
      const { data } = await conversationsRequest.$http.get(
        `/api/v1/projects/${projectUuid}/improvements/${improvementUuid}/affected_conversations`,
        { params: { page, page_size: pageSize } },
      );

      return AffectedConversationsAdapter.fromApi(data);
    },

    customAnalysis: {
      async list({ projectUuid }) {
        const { data } = await conversationsRequest.$http.get(
          `/api/v1/projects/${projectUuid}/improvements/custom_analysis/`,
        );

        return CustomAnalysisImprovementsAdapter.fromApiList(data);
      },

      async create({ projectUuid, title, definition, exclusions }) {
        const { data } = await conversationsRequest.$http.post(
          `/api/v1/projects/${projectUuid}/improvements/custom_analysis/`,
          CustomAnalysisImprovementsAdapter.toApiCreate({
            title,
            definition,
            exclusions,
          }),
        );

        const detail = CustomAnalysisImprovementsAdapter.fromApiDetail(data);

        if (!detail) {
          throw new Error('Invalid custom analysis response');
        }

        return detail;
      },

      async delete({ projectUuid, customAnalysisUuid }) {
        await conversationsRequest.$http.delete(
          `/api/v1/projects/${projectUuid}/improvements/custom_analysis/${customAnalysisUuid}/`,
        );
      },
    },
  },
};
