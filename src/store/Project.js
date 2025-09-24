import { defineStore } from 'pinia';
import { ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';

export const useProjectStore = defineStore('Project', () => {
  const uuid = sessionStorage.getItem('projectUuid') || '';
  const isMultiAgents = ref(null);
  const details = ref({
    status: null,
    contentBaseUuid: null,
  });

  async function updateIsMultiAgents(boolean) {
    isMultiAgents.value = boolean;
  }

  async function getRouterDetails() {
    details.value.status = 'loading';

    try {
      const { data } = await nexusaiAPI.router.read({
        projectUuid: uuid,
        obstructiveErrorProducer: true,
      });

      details.value = {...details.value, contentBaseUuid: data.uuid};
      details.value.status = 'success';
    } catch (error) {
      console.error(error);
      details.value.status = 'error';
    }
  }

  async function getProjectDetails() {
    details.value.status = 'loading';

    try {
      const data = await nexusaiAPI.router.tunings.projectDetails.read({
        projectUuid: uuid,
      });

      details.value = {...details.value, ...data};
      details.value.status = 'success';
    } catch (error) {
      console.error(error);
      details.value.status = 'error';
    }
  }

  return {
    uuid,
    isMultiAgents,
    updateIsMultiAgents,
    getRouterDetails,
    getProjectDetails,
    details,
  };
});
