<template>
  <section class="new-instruction-drawer__ai-analysis">
    <h2 class="ai-analysis__title">
      {{ $t('agents.instructions.new_instruction_drawer.ai_analysis.title') }}
    </h2>

    <section
      v-if="instructionsStore.instructionSuggestedByAI.status === 'loading'"
      class="ai-analysis__loading"
    >
      <UnnnicIconLoading size="20px" />

      <p class="ai-analysis__loading-text">
        {{
          $t(
            'agents.instructions.new_instruction_drawer.ai_analysis.validating',
          )
        }}
      </p>
    </section>

    <section
      v-else-if="
        instructionsStore.instructionSuggestedByAI.status === 'complete'
      "
      class="ai-analysis__results"
    ></section>
  </section>
</template>

<script setup lang="ts">
import { UnnnicIconLoading } from '@weni/unnnic-system';

import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();
</script>

<style lang="scss" scoped>
.new-instruction-drawer__ai-analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  .ai-analysis {
    &__title {
      font: $unnnic-font-display-3;
      color: $unnnic-color-fg-emphasized;
    }

    &__loading {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;
    }

    &__loading-text {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-muted;
    }
  }
}
</style>
