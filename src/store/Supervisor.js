import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { format, parseISO, subDays } from 'date-fns';
import { useAlertStore } from './Alert';
import { useRoute } from 'vue-router';
import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useFeatureFlagsStore } from './FeatureFlags';

import {
  getPaginationPayload,
  getPaginationStateFromResponse,
  normalizeConversationsBySource,
} from '@/api/adapters/supervisor/conversationSources';

import i18n from '@/utils/plugins/i18n';

export const useSupervisorStore = defineStore('Supervisor', () => {
  const projectUuid = computed(() => useProjectStore().uuid);
  const supervisorApi = nexusaiAPI.agent_builder.supervisor;
  const alertStore = useAlertStore();
  const route = useRoute();
  const { query } = route || {};
  const thisMonth = format(subDays(new Date(), 29), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const conversations = reactive({
    status: null,
    data: {
      results: [],
      next: null,
      newNext: null,
      legacyNext: null,
      legacyInitialAttempted: false,
    },
  });

  const selectedConversation = ref(null);

  let conversationsAbortController = null;

  const defaultFilters = {
    start: thisMonth,
    end: today,
    search: '',
    status: [],
    csat: [],
    topics: [],
  };

  const parseArray = (value) => value?.split(',').filter(Boolean) || null;
  const filters = reactive({
    start: query?.start ?? defaultFilters.start,
    end: query?.end ?? defaultFilters.end,
    search: query?.search ?? defaultFilters.search,
    status: parseArray(query?.status) || defaultFilters.status,
    csat: parseArray(query?.csat) || defaultFilters.csat,
    topics: parseArray(query?.topics) || defaultFilters.topics,
  });

  const temporaryFilters = reactive({
    start: filters.start,
    end: filters.end,
    search: filters.search,
    status: filters.status,
    csat: filters.csat,
    topics: filters.topics,
  });

  const topics = ref([]);

  const queryConversationUuid = ref(query?.uuid || '');

  function resetFilters() {
    const { start, end, status, csat, topics } = defaultFilters;

    [filters, temporaryFilters].forEach((filter) => {
      filter.start = start;
      filter.end = end;
      filter.status = status;
      filter.csat = csat;
      filter.topics = topics;
    });
  }

  function updateFilters() {
    filters.start = temporaryFilters.start;
    filters.end = temporaryFilters.end;
    filters.search = temporaryFilters.search;
    filters.status = temporaryFilters.status;
    filters.csat = temporaryFilters.csat;
    filters.topics = temporaryFilters.topics;
  }

  function getInitialSelectFilter(filter, filterOptions) {
    return temporaryFilters[filter].map((item) => {
      if (item === '') return { label: '', value: '' };

      return filterOptions.value.find(
        (option) => option.value === item || option.label === item,
      );
    });
  }

  async function loadConversations(page = 1) {
    conversations.status = 'loading';

    const featureFlagsStore = useFeatureFlagsStore();
    await featureFlagsStore.whenUserAttributed();

    if (conversationsAbortController) {
      await conversationsAbortController.abort();
    }

    conversationsAbortController = new AbortController();
    if (page === 1) {
      conversations.data.results = [];
      conversations.data.next = null;
      conversations.data.newNext = null;
      conversations.data.legacyNext = null;
      conversations.data.legacyInitialAttempted = false;
    }

    const formatDateParam = (date) =>
      date ? format(parseISO(date), 'dd-MM-yyyy') : '';

    const baseFilters = {
      page,
      start: formatDateParam(filters.start),
      end: formatDateParam(filters.end),
      search: filters.search,
      status: filters.status,
      csat: filters.csat,
      topics: filters.topics,
    };

    const paginationPayload = getPaginationPayload(
      page,
      conversations.data,
      conversations.data.results,
    );

    try {
      const currentConversationsData = { ...conversations.data };
      const requestPayload = {
        projectUuid: projectUuid.value,
        signal: conversationsAbortController.signal,
        hideGenericErrorAlert: true,
        filters: paginationPayload ? { ...baseFilters, page: 1 } : baseFilters,
        pagination: paginationPayload?.pagination,
        onlyLegacy: paginationPayload?.onlyLegacy,
      };

      const response = await supervisorApi.conversations.list(requestPayload);

      const responseData =
        response && !Array.isArray(response) ? response : { results: response };
      const responseResults = Array.isArray(responseData?.results)
        ? responseData.results
        : [];

      const mergedResults = [...conversations.data.results, ...responseResults];
      const normalizedResults = normalizeConversationsBySource(mergedResults);
      const count = responseData?.count ?? normalizedResults.length;

      conversations.status = 'complete';
      conversations.data = {
        ...responseData,
        count,
        results: normalizedResults,
        legacyInitialAttempted: currentConversationsData.legacyInitialAttempted,
      };

      const paginationState = getPaginationStateFromResponse(
        responseData,
        currentConversationsData,
      );
      if (paginationState) {
        conversations.data.next = paginationState.next;
        conversations.data.newNext = paginationState.newNext;
        conversations.data.legacyNext = paginationState.legacyNext;
      }

      if (paginationPayload?.onlyLegacy) {
        conversations.data.legacyInitialAttempted = true;
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;

      conversations.status = 'error';
      console.error('Error loading conversations:', error);
      alertStore.add({
        type: 'error',
        text: i18n.global.t(
          'agent_builder.supervisor.load_conversations.error',
        ),
      });
    } finally {
      conversationsAbortController = null;
    }
  }

  async function loadSelectedConversationData({ next = false } = {}) {
    const conversation = selectedConversation.value;

    if (!conversation) return;
    if (conversation.data.status === 'loading') return;
    if (next && !conversation.data.next) return;

    try {
      selectedConversation.value.data.status = 'loading';

      const params = {
        projectUuid: projectUuid.value,
        start: selectedConversation.value.start,
        end: selectedConversation.value.end,
        urn: selectedConversation.value.urn,
        source: selectedConversation.value.source,
        uuid: selectedConversation.value.uuid,
        next: next ? selectedConversation.value.data.next : null,
      };

      const response = await supervisorApi.conversations.getById(params);

      const mergedResults = next
        ? [...response.results, ...selectedConversation.value.data.results]
        : response.results;

      selectedConversation.value.data = {
        ...selectedConversation.value.data,
        ...response,
        results: mergedResults,
        status: 'complete',
      };
    } catch (error) {
      console.error('Error loading conversation data:', error);

      if (selectedConversation.value?.data) {
        selectedConversation.value.data.status = 'error';
      }
    }
  }

  async function loadLogs({ messageId }) {
    try {
      const response =
        await nexusaiAPI.agent_builder.supervisor.conversations.getLogs({
          projectUuid: projectUuid.value,
          messageId,
        });

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  function selectConversation(uuid) {
    if (!uuid) {
      selectedConversation.value = null;
      queryConversationUuid.value = '';
      return;
    }

    if (selectedConversation.value?.uuid === uuid) return;

    const handleMatch = (conversation) => {
      return conversation.uuid === uuid;
    };

    const conversation = conversations.data.results?.find(handleMatch);

    queryConversationUuid.value = uuid;

    selectedConversation.value = {
      ...conversation,
      data: {
        status: null,
      },
    };
  }

  async function getTopics() {
    const response = await supervisorApi.conversations.getTopics({
      projectUuid: projectUuid.value,
    });

    topics.value = response.map((topic) => ({
      label: topic.name,
      value: topic.uuid,
    }));
  }

  async function exportSupervisorData({ token }) {
    try {
      await supervisorApi.conversations.export({
        hideGenericErrorAlert: true,
        projectUuid: projectUuid.value,
        token,
      });

      alertStore.add({
        type: 'success',
        text: i18n.global.t('agent_builder.supervisor.export.success'),
      });
    } catch {
      alertStore.add({
        type: 'error',
        text: i18n.global.t('agent_builder.supervisor.export.error'),
      });
    }
  }

  return {
    filters,
    defaultFilters,
    temporaryFilters,
    topics,
    resetFilters,
    updateFilters,
    getInitialSelectFilter,
    getTopics,

    conversations,
    loadConversations,

    queryConversationUuid,
    selectedConversation,
    loadSelectedConversationData,
    selectConversation,

    loadLogs,

    exportSupervisorData,
  };
});
