import { defineStore } from 'pinia';

import { computed, ref } from 'vue';

import WS from '@/websocket/setup';

import { processLog } from '@/utils/previewLogs';
import { useProjectStore } from './Project';
import { useUserStore } from './User';

export const usePreviewStore = defineStore('preview', () => {
  const ws = ref(null);
  const logs = ref([]);
  const collaboratorsLogs = computed(() =>
    logs.value.filter((log) => log.type === 'trace_update'),
  );
  const activeAgent = computed(() => {
    const lastLog = logs.value.at(-1);
    const rawAgentName = lastLog?.config?.agentName;

    return {
      name: rawAgentName === 'manager' ? 'Manager' : rawAgentName,
      currentTask: lastLog?.config?.summary,
    };
  });

  function addLog(log) {
    logs.value.push(log.type === 'trace_update' ? processLog({ log }) : log);
  }

  function clearLogs() {
    logs.value = [];
  }

  function connectWS() {
    if (ws.value) return;

    const projectUuid = useProjectStore().uuid;

    const wsOptions = {
      project: projectUuid,
      token: useUserStore().user.token.replace('Bearer ', ''),
      endpoint: 'preview',
      path: `${projectUuid}/simulation`,
    };

    const newWs = new WS(wsOptions);
    newWs.connect();

    ws.value = newWs;
  }

  function disconnectWS() {
    if (!ws.value) return;

    ws.value.disconnect();
    ws.value = null;
  }

  return {
    ws,
    connectWS,
    disconnectWS,
    clearLogs,
    activeAgent,
    collaboratorsLogs,
    logs,
    addLog,
  };
});
