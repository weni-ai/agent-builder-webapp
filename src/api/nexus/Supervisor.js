import nexusRequest from '../nexusaiRequest';
import { fetchConversationList } from '../adapters/supervisor/conversationSources';
import { ConversationMessageAdapter } from '../adapters/supervisor/conversationMessage';
import { ImprovementsAdapter } from '../adapters/supervisor/improvements';

const MOCK_ANALYSIS_TOTAL = 5;
const MOCK_ANALYSIS_DELAY_MS = 400;

let mockAnalysisState = null;

const mockImprovementsResponse = {
  improvements: [
    {
      uuid: 'improvement-uuid-1',
      text: 'The agent tone does not match the configured brand voice in refund conversations.',
      type: 'brand_voice_mismatch',
      conversations_count: 18,
    },
    {
      uuid: 'improvement-uuid-2',
      text: 'The agent asks too many questions before providing an answer about order status.',
      type: 'many_questions_before_answering',
      conversations_count: 12,
    },
    {
      uuid: 'improvement-uuid-3',
      text: 'The agent lacks static knowledge about the return policy deadline.',
      type: 'missing_static_knowledge',
      conversations_count: 9,
    },
    {
      uuid: 'improvement-uuid-4',
      text: 'The agent did not follow the instruction to always confirm the customer email.',
      type: 'instruction_non_compliance',
      conversations_count: 7,
    },
    {
      uuid: 'improvement-uuid-5',
      text: 'Catalog search results did not match the product the customer described.',
      type: 'catalog_search_mismatch',
      conversations_count: 5,
    },
    {
      uuid: 'improvement-uuid-6',
      text: 'The agent resolved a complex exchange request quickly while keeping a helpful tone.',
      type: 'amazing_conversation',
      conversations_count: 3,
    },
  ],
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createMockAnalysisState() {
  return {
    improvements_task: {
      is_running: true,
      progress: 0,
      total: MOCK_ANALYSIS_TOTAL,
    },
    improvements: [],
  };
}

function advanceMockAnalysisState(state) {
  if (!state.improvements_task.is_running) {
    return state;
  }

  const nextProgress = Math.min(
    state.improvements_task.progress + 1,
    state.improvements_task.total,
  );

  state.improvements_task.progress = nextProgress;

  if (nextProgress >= state.improvements_task.total) {
    state.improvements_task.is_running = false;
    state.improvements = mockImprovementsResponse.improvements;
  }

  return state;
}

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
  improvements: {
    async runAnalysis({ projectUuid: _projectUuid }) {
      mockAnalysisState = createMockAnalysisState();

      await wait(MOCK_ANALYSIS_DELAY_MS);

      return ImprovementsAdapter.fromApi(mockAnalysisState);
    },

    async getAnalysis({ projectUuid: _projectUuid }) {
      if (!mockAnalysisState) {
        throw new Error('No improvements analysis task found.');
      }

      await wait(MOCK_ANALYSIS_DELAY_MS);

      advanceMockAnalysisState(mockAnalysisState);

      return ImprovementsAdapter.fromApi(mockAnalysisState);
    },
  },
};
