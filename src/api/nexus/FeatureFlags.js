import { computed } from 'vue';
import request from '@/api/nexusaiRequest';
import { useProjectStore } from '@/store/Project';

const projectUuid = computed(() => useProjectStore().uuid);

export const FeatureFlags = {
  read({ projectUuid: uuid = projectUuid.value } = {}) {
    return request.$http.get('api/feature_flags/', {
      params: { project_uuid: uuid },
    });
  },
};
