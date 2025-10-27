<template>
  <UnnnicPopover>
    <UnnnicPopoverTrigger class="instruction-ai-suggestion__trigger">
      <UnnnicIcon
        icon="lightbulb"
        size="sm"
        scheme="teal-600"
      />
      {{ aiSuggestionTranslation('trigger') }}
    </UnnnicPopoverTrigger>
    <UnnnicPopoverContent
      align="end"
      size="large"
      class="instruction-ai-suggestion__content"
    >
      <h3 class="instruction-ai-suggestion__title">
        {{ aiSuggestionTranslation('title') }}
      </h3>
      <UnnnicTextArea
        :modelValue="aiSuggestion"
        :placeholder="
          $t('agent_builder.instructions.new_instruction.textarea.placeholder')
        "
        class="instruction-ai-suggestion__textarea"
      />
      <template #footer>
        <UnnnicButton>
          {{ aiSuggestionTranslation('apply_button') }}
        </UnnnicButton>
      </template>
    </UnnnicPopoverContent>
  </UnnnicPopover>
</template>

<script setup lang="ts">
import { useInstructionsStore } from '@/store/Instructions';
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

const instructionsStore = useInstructionsStore();

const aiSuggestionTranslation = (key: string) =>
  i18n.global.t(
    `agent_builder.instructions.new_instruction.validate_instruction_by_ai.see_ai_suggestion.${key}`,
  );

const aiSuggestion = computed(() => {
  return instructionsStore.instructionSuggestedByAI.data.suggestion;
});
</script>

<style lang="scss">
.instruction-ai-suggestion__trigger {
  position: absolute;
  right: $unnnic-space-4;
  bottom: $unnnic-space-3;

  font: $unnnic-font-action;
  color: $unnnic-color-fg-active;
}

.instruction-ai-suggestion__content {
  display: grid;
  gap: $unnnic-space-4;
}

.instruction-ai-suggestion__title {
  font: $unnnic-font-display-3;
  color: $unnnic-color-fg-emphasized;
}

.instruction-ai-suggestion__textarea {
  .unnnic-text-area__textarea {
    resize: none;
  }
}
</style>
