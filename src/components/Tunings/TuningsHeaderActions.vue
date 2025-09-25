<template>
  <section :class="['tunings-header-actions']">
    <UnnnicButton
      type="secondary"
      :loading="projectStore.details.status === 'loading'"
      @click="showModalProjectDetails = true"
    >
      {{ $t('agent_builder.tunings.project_details') }}
    </UnnnicButton>
    <UnnnicButton
      :disabled="isTuningsSaveButtonDisabled"
      :loading="isTuningsSaveButtonLoading"
      @click="saveTunings"
    >
      {{ $t('router.tunings.save_changes') }}
    </UnnnicButton>

    <ProjectDetailsModal
      :modelValue="showModalProjectDetails"
      @update:model-value="showModalProjectDetails = $event"
    />
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { useProjectStore } from '@/store/Project';

import ProjectDetailsModal from './ProjectDetailsModal/index.vue';

const tuningsStore = useTuningsStore();
const projectStore = useProjectStore();

const showModalProjectDetails = ref(false);

const isTuningsSaveButtonDisabled = computed(() => {
  return !tuningsStore.isCredentialsValid && !tuningsStore.isSettingsValid;
});

const isTuningsSaveButtonLoading = computed(() => {
  return tuningsStore.isLoadingTunings;
});

async function saveTunings() {
  tuningsStore.saveTunings();
}

onMounted(async () => {
  await projectStore.getProjectDetails();
});
</script>

<style lang="scss" scoped>
.tunings-header-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-spacing-xs;
}
</style>
