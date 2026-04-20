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

interface ProjectInfo {
  status: null | 'loading' | 'success' | 'error';
  wwcChannelUuid: string;
}

export const useProjectStore = defineStore('Project', () => {
  const uuid = moduleStorage.getItem('projectUuid') || '';
  const details = ref<ProjectDetails>({
    status: null,
  });

  const project = ref<ProjectInfo>({
    status: null,
    wwcChannelUuid: '',
  });

  async function getProject() {
    project.value.status = 'loading';

    try {
      const { data } = await nexusaiAPI.router.project.read({
        projectUuid: uuid,
      });

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
    getProject,
    getProjectDetails,
    project,
    details,
  };
});
