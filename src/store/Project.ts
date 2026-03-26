import { defineStore } from 'pinia';
import { ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { moduleStorage } from '@/utils/storage';

interface ProjectDetails {
  status: null | 'loading' | 'success' | 'error';
  backend?: string;
  agentsModels?: { name: string; model: string }[];
  charactersCount?: number;
}

export const useProjectStore = defineStore('Project', () => {
  const uuid = moduleStorage.getItem('projectUuid') || '';
  const details = ref<ProjectDetails>({
    status: null,
  });

  async function getProjectDetails() {
    details.value.status = 'loading';

    try {
      const data = await nexusaiAPI.router.tunings.projectDetails.read({
        projectUuid: uuid,
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
    getProjectDetails,
    details,
  };
});
