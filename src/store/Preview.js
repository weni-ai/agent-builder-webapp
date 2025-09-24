import { defineStore } from 'pinia';

import { computed, ref } from 'vue';

import WS from '@/websocket/setup';

import { useAgentsTeamStore } from './AgentsTeam';
import { processLog } from '@/utils/previewLogs';
import { useProjectStore } from './Project';
import { useUserStore } from './User';

export const usePreviewStore = defineStore('preview', () => {
  const ws = ref(null);
  const logs = ref([]);
  const collaboratorInvoked = ref('');
  const collaboratorsLogs = computed(() =>
    logs.value.filter((log) => log.type === 'trace_update'),
  );
  const activeAgent = computed(() => {
    const agentsTeamStore = useAgentsTeamStore();
    const lastLog = logs.value.at(-1);

    const lastLogAgentId = lastLog?.config?.agentName || 'manager';

    const agent = agentsTeamStore.activeTeam.data?.agents?.find(
      (agent) => agent?.id && lastLogAgentId && agent?.id === lastLogAgentId,
    );

    return {
      ...(agent || agentsTeamStore.activeTeam.data?.manager),
      currentTask: lastLog?.config?.summary,
    };
  });

  function addLog(log) {
    if (log.type === 'trace_update') {
      const processedLog = processLog({
        log,
        currentAgent: collaboratorInvoked.value,
      });

      collaboratorInvoked.value = processedLog.config.currentAgent;
      logs.value.push(processedLog);
    } else {
      logs.value.push(log);
    }
  }

  function clearLogs() {
    logs.value = [];
  }

  function connectWS() {
    if (ws.value) return;

    const newWs = new WS({
      project: useProjectStore().uuid,
      token: useUserStore().user.token.replace('Bearer ', ''),
      endpoint: 'preview',
    });
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
    collaboratorInvoked,
  };
});
