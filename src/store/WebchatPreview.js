import { defineStore } from 'pinia';
import { ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useProjectStore } from './Project';
import { useFlowPreviewStore } from './FlowPreview';
import { useWebchatLoader } from '@/composables/webchat/useWebchatLoader';

export const useWebchatPreviewStore = defineStore('webchatPreview', () => {
  const projectStore = useProjectStore();
  const flowPreviewStore = useFlowPreviewStore();

  const isWebchatLoaded = ref(false);
  const isWebchatReady = ref(false);
  const sessionVersion = ref(0);

  async function changeManagerModel(managerId) {
    await nexusaiAPI.agent_builder.simulation.setManagerModel({
      projectUuid: projectStore.uuid,
      urn: flowPreviewStore.preview.contact.urn,
      managerFoundationModel: managerId,
    });
  }

  async function endSession() {
    await nexusaiAPI.agent_builder.simulation.endSession({
      projectUuid: projectStore.uuid,
      urn: flowPreviewStore.preview.contact.urn,
    });

    const webchat = useWebchatLoader().getInstance();
    await webchat?.clear();
    await webchat?.clearPageHistory();
    await webchat?.clearCart();
    sessionVersion.value += 1;
  }

  function setWebchatLoaded(value) {
    isWebchatLoaded.value = value;
  }

  return {
    isWebchatLoaded,
    isWebchatReady,
    sessionVersion,
    setWebchatLoaded,
    changeManagerModel,
    endSession,
  };
});
