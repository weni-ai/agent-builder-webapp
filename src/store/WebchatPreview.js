import { defineStore } from 'pinia';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useProjectStore } from './Project';
import { useFlowPreviewStore } from './FlowPreview';

export const useWebchatPreviewStore = defineStore('webchatPreview', () => {
  const projectStore = useProjectStore();
  const flowPreviewStore = useFlowPreviewStore();

  async function changeManagerModel(managerId) {
    await nexusaiAPI.agent_builder.simulation.setManagerModel({
      projectUuid: projectStore.uuid,
      managerFoundationModel: managerId,
    });
  }

  async function endSession() {
    await nexusaiAPI.agent_builder.simulation.endSession({
      projectUuid: projectStore.uuid,
      urn: flowPreviewStore.preview.contact.urn,
    });

    await window.WebChat?.clear();
  }

  return { changeManagerModel, endSession };
});
