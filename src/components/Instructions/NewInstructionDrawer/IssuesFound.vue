<template>
  <UnnnicDisclaimer
    :key="classification.type"
    data-testid="modal-validate-instruction-validation-results-toast"
    :type="classification.type"
    :title="classification.name"
    :description="classification.reason"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';
import { Classification } from '@/store/types/Instructions.types';

import i18n from '@/utils/plugins/i18n';
import { formatListToReadable } from '@/utils/formatters';

const instructionsStore = useInstructionsStore();
const classification = computed<{
  type: 'attention' | 'success';
  name: string;
  reason: string;
}>(() => {
  const getTranslation = (key: string) =>
    i18n.global.t(
      `agents.instructions.new_instruction_drawer.ai_analysis.issues_types.${key}`,
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
      type: 'attention' as const,
      name: titleMappings[result.name] || result.reason,
    }));

    return {
      type: 'attention' as const,
      name: formatListToReadable(
        resultList.map((result: Classification) => result.name),
      ),
      reason: resultList[0].reason,
    };
  }

  return {
    type: 'success' as const,
    name: getTranslation('no_issues_found'),
    reason: '',
  };
});
</script>
