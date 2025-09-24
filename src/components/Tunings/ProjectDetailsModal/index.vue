<template>
  <UnnnicModalDialog
    class="project-details-modal"
    data-testid="project-details-modal"
    :modelValue="modelValue"
    showCloseIcon
    size="lg"
    :title="$t('agent_builder.tunings.project_details')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <ProjectInfo
      :title="
        $t('agent_builder.tunings.agents_backend')
      "
      :description="projectDetails.backend"
    />

      <UnnnicDivider ySpacing="sm" />

      <ProjectInfo
        v-for="agent in projectDetails.agentsModels"
        :key="agent.name"
        :title="$t('agent_builder.tunings.agent_model', { agent: agent.name })"
        :description="agent.model"
      />

      <template v-if="projectDetails.charactersCount">
        <UnnnicDivider ySpacing="sm" />

        <ProjectInfo
          :title="$t('agent_builder.tunings.characters_usage')"
          :description="charactersUsage"
        />

        <p class="project-details-modal__info-explanation">
          {{ $t('agent_builder.tunings.characters_usage_description') }}
        </p>
      </template>
  </UnnnicModalDialog>
</template>

<script setup>
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

import { useProjectStore } from '@/store/Project';
import ProjectInfo from './ProjectInfo.vue';

const emit = defineEmits(['update:modelValue']);
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const projectStore = useProjectStore();

const projectDetails = computed(() => projectStore.details);
const charactersUsage = computed(() => {
  const count = projectDetails.value.charactersCount;
  const maxCount = 20000;

  const numberFormatter = new Intl.NumberFormat(i18n.global.locale);
  const formattedCount = numberFormatter.format(count);
  const formattedMaxCount = numberFormatter.format(maxCount);

  return `${formattedCount} / ${formattedMaxCount} (${Math.round((count / maxCount) * 100)}%)`;
});
</script>

<style lang="scss" scoped>
.project-details-modal {
  &__info-explanation {
    margin-top: $unnnic-spacing-xs;

    color: $unnnic-color-fg-base;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-text-body;
    line-height: $unnnic-line-height-body;
  }
}
</style>
