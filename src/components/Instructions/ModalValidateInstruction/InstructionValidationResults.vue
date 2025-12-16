<template>
  <section class="modal-validate-instruction__validation-results">
    <h2
      class="modal-validate-instruction__title"
      data-testid="modal-validate-instruction-validation-results-title"
    >
      {{
        $t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.results.title',
        )
      }}
    </h2>
    <UnnnicSkeletonLoading
      v-if="instructionsStore.instructionSuggestedByAI.status === 'loading'"
      data-testid="modal-validate-instruction-validation-results-loading"
      class="modal-validate-instruction__loading"
      tag="div"
      width="100%"
      height="81px"
    />
    <template
      v-else-if="
        instructionsStore.instructionSuggestedByAI.status === 'complete'
      "
    >
      <TempToast
        :key="classification.type"
        data-testid="modal-validate-instruction-validation-results-toast"
        :type="classification.type"
        :title="classification.name"
        :description="classification.reason"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';
import { Classification } from '@/store/types/Instructions.types';

import i18n from '@/utils/plugins/i18n';
import { formatListToReadable } from '@/utils/formatters';

import TempToast from './TempToast.vue';

const instructionsStore = useInstructionsStore();
const classification = computed<{
  type: 'warning' | 'success';
  name: string;
  reason: string;
}>(() => {
  const getTranslation = (key: string) =>
    i18n.global.t(
      `agent_builder.instructions.new_instruction.validate_instruction_by_ai.results.${key}`,
    );

  const titleMappings = {
    duplicate: getTranslation('duplicate'),
    conflicting: getTranslation('conflicts'),
    ambiguity: getTranslation('ambiguity'),
    lack_of_clarity: getTranslation('lack_of_clarity'),
  };
  const results =
    instructionsStore.instructionSuggestedByAI.data.classification;

  if (results.length) {
    const resultList = results.map((result: Classification) => ({
      ...result,
      type: 'warning' as const,
      name: titleMappings[result.name] || result.reason,
    }));

    return {
      type: 'warning' as const,
      name: formatListToReadable(
        resultList.map((result: Classification) => result.name),
      ),
      reason: resultList[0].reason,
    };
  }

  return {
    type: 'success' as const,
    name: getTranslation('no_problems_found'),
    reason: '',
  };
});
</script>

<style lang="scss" scoped>
.modal-validate-instruction {
  &__validation-results {
    display: grid;
    gap: $unnnic-space-4;
  }

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-fg-emphasized;
  }

  &__loading {
    display: flex;
  }
}
</style>
