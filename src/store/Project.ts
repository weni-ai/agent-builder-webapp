import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';

/**
 * Lives at module scope so the UUID survives Pinia `$dispose()` (federated
 * remounts) and can be set during the iframe handshake before `createPinia()`.
 * It must not go into Web Storage: that is shared across tabs.
 */
const currentProjectUuid = ref('');

export function setProjectUuid(uuid: string) {
  currentProjectUuid.value = uuid || '';
}

interface ProjectDetails {
  status: null | 'loading' | 'success' | 'error';
  backend?: string;
  agentsModels?: { name: string; model: string }[];
  charactersCount?: number;
}

interface ProjectInfo {
  status: null | 'loading' | 'success' | 'error';
  name: string;
  wwcChannelUuid: string;
}

export const useProjectStore = defineStore('Project', () => {
  const uuid = computed(() => currentProjectUuid.value);

  const details = ref<ProjectDetails>({
    status: null,
  });

  const project = ref<ProjectInfo>({
    status: null,
    name: '',
    wwcChannelUuid: '',
  });

  async function getProject() {
    project.value.status = 'loading';

    try {
      const { data } = await nexusaiAPI.router.project.read({
        projectUuid: uuid.value,
      });

      project.value.name = data.name ?? '';
      project.value.wwcChannelUuid = data.default_channel_uuid;
      project.value.status = 'success';
    } catch (error) {
      console.error(error);
      project.value.status = 'error';
    }
  }

  async function getProjectDetails() {
    details.value.status = 'loading';

    try {
      const data = await nexusaiAPI.router.tunings.projectDetails.read({
        projectUuid: uuid.value,
      });

      details.value = { ...details.value, ...data };
      details.value.status = 'success';
    } catch (error) {
      console.error(error);
      details.value.status = 'error';
    }
  }

  return {
    uuid,
    getProject,
    getProjectDetails,
    project,
    details,
  };
});
