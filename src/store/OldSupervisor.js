import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { format, parseISO, subDays } from 'date-fns';

import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';
import { useRoute } from 'vue-router';

import supervisorApi from '@/api/nexus/OldSupervisor';

import { PerformanceAdapter } from '@/api/adapters/supervisor/performance';
import i18n from '@/utils/plugins/i18n';

export const useOldSupervisorStore = defineStore('OldSupervisor', () => {
  const projectUuid = computed(() => useProjectStore().uuid);
  const alertStore = useAlertStore();
  const route = useRoute();
  const last30Days = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');

  const forwardStats = reactive({
    status: null,
    data: {
      attendedByAgent: 0,
      forwardedHumanSupport: 0,
    },
  });

  const conversations = reactive({
    status: null,
    data: [],
  });

  const selectedConversation = ref(null);

  const filters = reactive({
    start: route.query.start || last30Days,
    end: route.query.end || today,
    search: route.query.search || '',
    type: route.query.type || '',
    conversationId: route.query.conversationId || '',
  });

  async function loadForwardStats() {
    forwardStats.status = 'loading';
    try {
      const response = await supervisorApi.conversations.forwardStats({
        projectUuid: projectUuid.value,
        start: format(parseISO(filters.start), 'dd-MM-yyyy'),
        end: format(parseISO(filters.end), 'dd-MM-yyyy'),
      });

      const adaptedData = PerformanceAdapter.fromApi(response);
      const total =
        adaptedData.attendedByAgent + adaptedData.forwardedHumanSupport;

      const calculatePercentage = (value) =>
        total === 0 ? 0 : Math.round((value / total) * 100);

      forwardStats.data = {
        attendedByAgent: calculatePercentage(adaptedData.attendedByAgent),
        forwardedHumanSupport: calculatePercentage(
          adaptedData.forwardedHumanSupport,
        ),
      };

      forwardStats.status = 'complete';
    } catch (error) {
      forwardStats.status = 'error';
    }
  }

  async function loadConversations(page = 1) {
    conversations.status = 'loading';

    const formatDateParam = (date) => format(parseISO(date), 'dd-MM-yyyy');

    try {
      const response = await supervisorApi.conversations.list({
        projectUuid: projectUuid.value,
        page,
        start: formatDateParam(filters.start),
        end: formatDateParam(filters.end),
        search: filters.search,
        type: filters.type,
      });

      conversations.status = 'complete';
      conversations.data = response;
    } catch (error) {
      conversations.status = 'error';
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
        start: selectedConversation.value.created_on,
        end: selectedConversation.value.end_on,
        urn: selectedConversation.value.urn,
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

  function selectConversation(conversationId) {
    if (!conversationId) {
      selectedConversation.value = null;
      filters.conversationId = '';
      return;
    }

    const conversation = conversations.data.results.find(
      (conversation) => conversation.id == conversationId,
    );

    selectedConversation.value = {
      ...conversation,
      data: {
        status: null,
      },
    };
    filters.conversationId = conversationId;
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
    } catch (error) {
      alertStore.add({
        type: 'error',
        text: i18n.global.t('agent_builder.supervisor.export.error'),
      });
    }
  }

  return {
    forwardStats,
    loadForwardStats,
    conversations,
    loadConversations,
    loadSelectedConversationData,
    selectConversation,
    selectedConversation,
    filters,
    exportSupervisorData,
  };
});
