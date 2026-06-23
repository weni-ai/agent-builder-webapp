import nexusRequest from '../nexusaiRequest';
import { fetchConversationList } from '../adapters/supervisor/conversationSources';
import { ConversationMessageAdapter } from '../adapters/supervisor/conversationMessage';
import { ImprovementsAdapter } from '../adapters/supervisor/improvements';

const MOCK_ANALYSIS_TOTAL = 5;
const MOCK_ANALYSIS_DELAY_MS = 400;

let mockAnalysisState = null;

const mockImprovementsResponse = {
  conversations_count: 54,
  improvements: [
    {
      uuid: 'improvement-uuid-1',
      text: 'The agent tone does not match the configured brand voice in refund conversations.',
      type: 'personality_deviation',
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
      type: 'wrong_behavior_due_to_instructions',
      conversations_count: 7,
    },
    {
      uuid: 'improvement-uuid-5',
      text: 'Catalog search results did not match the product the customer described.',
      type: 'poor_product_search_results',
      conversations_count: 5,
    },
    {
      uuid: 'improvement-uuid-6',
      text: 'The agent repeated the same response across multiple turns.',
      type: 'repetitive_response',
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
    conversations_count: 0,
    improvements_task: {
      is_running: true,
      progress: 0,
      total: MOCK_ANALYSIS_TOTAL,
      created_at: '2026-06-23T12:00:00Z',
    },
    improvements: [],
  };
}

function getDefaultMockResponse() {
  return {
    conversations_count: mockImprovementsResponse.conversations_count,
    improvements_task: {
      is_running: false,
      progress: MOCK_ANALYSIS_TOTAL,
      total: MOCK_ANALYSIS_TOTAL,
      created_at: '2026-06-01T10:00:00Z',
    },
    improvements: mockImprovementsResponse.improvements,
  };
}

function advanceMockAnalysisState(state) {
  if (!state.improvements_task.is_running) {
    return state;
  }

  const { total } = state.improvements_task;
  const nextProgress = Math.min(state.improvements_task.progress + 1, total);
  const allImprovements = mockImprovementsResponse.improvements;
  const halfCount = Math.ceil(allImprovements.length / 2);

  state.improvements_task.progress = nextProgress;

  if (nextProgress === total - 1) {
    state.improvements = allImprovements.slice(0, halfCount);
    state.conversations_count = mockImprovementsResponse.conversations_count;
  } else if (nextProgress >= total) {
    state.improvements_task.is_running = false;
    state.improvements = allImprovements;
    state.conversations_count = mockImprovementsResponse.conversations_count;
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
      // await nexusRequest.$http.post(
      //   `/api/projects/${projectUuid}/improvements/run`,
      // );

      mockAnalysisState = createMockAnalysisState();

      await wait(MOCK_ANALYSIS_DELAY_MS);
    },

    async getAnalysis({ projectUuid: _projectUuid }) {
      // const { data } = await nexusRequest.$http.get(
      //   `/api/projects/${projectUuid}/improvements`,
      // );
      //
      // return ImprovementsAdapter.fromApi(data);

      await wait(MOCK_ANALYSIS_DELAY_MS);

      if (!mockAnalysisState) {
        return ImprovementsAdapter.fromApi(getDefaultMockResponse());
      }

      advanceMockAnalysisState(mockAnalysisState);

      return ImprovementsAdapter.fromApi(mockAnalysisState);
    },
  },
};
