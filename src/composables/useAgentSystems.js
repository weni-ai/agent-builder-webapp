import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

export default function useAgentSystems() {
  const agentsTeamStore = useAgentsTeamStore();
  const { availableSystems } = storeToRefs(agentsTeamStore);

  const systems = computed(() =>
    availableSystems.value.map((system) => ({
      slug: system.slug,
      name: system.name,
      icon: system.logo || '',
    })),
  );

  const systemsMap = computed(() => {
    const map = {};

    systems.value.forEach((system) => {
      const normalizedName = normalizeKey(system.name);
      const normalizedSlug = normalizeKey(system.slug);

      if (normalizedName) {
        map[normalizedName] = system;
      }

      if (normalizedSlug) {
        map[normalizedSlug] = system;
      }
    });

    return map;
  });

  function getSystemObject(systemName) {
    const key = normalizeKey(systemName);
    if (!key) return undefined;

    return systemsMap.value[key];
  }

  function getSystemsObjects(systemsNames = []) {
    return systemsNames
      .map((systemName) => getSystemObject(systemName))
      .filter(Boolean);
  }

  function normalizeKey(value) {
    if (!value) return '';
    return value.toString().trim().toLowerCase();
  }

  return {
    systems,
    getSystemObject,
    getSystemsObjects,
  };
}
