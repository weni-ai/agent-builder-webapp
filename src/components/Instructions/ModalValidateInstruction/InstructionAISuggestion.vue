<template>
  <section class="instruction-ai-suggestion">
    <section
      v-if="suggestionApplied"
      class="instruction-ai-suggestion__suggestion-applied"
    >
      <UnnnicIcon
        icon="check_circle"
        size="md"
        scheme="fg-success"
      />
      {{ aiSuggestionTranslation('suggestion_applied') }}
    </section>

    <UnnnicPopover
      v-else
      v-model:open="isPopoverOpen"
      @update:open="handlePopoverOpenChange"
    >
      <UnnnicPopoverTrigger
        :class="[
          'instruction-ai-suggestion__trigger',
          {
            'instruction-ai-suggestion__trigger--disabled': triggerDisabled,
          },
        ]"
      >
        <UnnnicToolTip
          side="top"
          :text="aiSuggestionTranslation('no_ai_suggestion_tooltip')"
          :enabled="triggerDisabled"
          maxWidth="18rem"
          data-test="card-tooltip"
        >
          <UnnnicIcon
            icon="bi:stars"
            size="sm"
            :scheme="triggerDisabled ? 'gray-300' : 'teal-600'"
          />
          {{ aiSuggestionTranslation('trigger') }}
        </UnnnicToolTip>
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
            $t(
              'agent_builder.instructions.new_instruction.textarea.placeholder',
            )
          "
          class="instruction-ai-suggestion__textarea"
          @update:model-value="
            instructionsStore.instructionSuggestedByAI.data.suggestion = $event
          "
        />
        <template #footer>
          <UnnnicButton
            iconLeft="bi:stars"
            @click="applySuggestion"
          >
            {{ aiSuggestionTranslation('apply_button') }}
          </UnnnicButton>
        </template>
      </UnnnicPopoverContent>
    </UnnnicPopover>
  </section>
</template>

<script setup lang="ts">
import { useInstructionsStore } from '@/store/Instructions';
import { computed, ref } from 'vue';
import i18n from '@/utils/plugins/i18n';

const emit = defineEmits(['applySuggestion']);

const instructionsStore = useInstructionsStore();
const isPopoverOpen = ref(false);

const aiSuggestionTranslation = (key: string) =>
  i18n.global.t(
    `agent_builder.instructions.new_instruction.validate_instruction_by_ai.see_ai_suggestion.${key}`,
  );

const aiSuggestion = computed(() => {
  return instructionsStore.instructionSuggestedByAI.data.suggestion;
});

const suggestionApplied = computed(() => {
  return instructionsStore.instructionSuggestedByAI.suggestionApplied;
});

const triggerDisabled = computed(() => {
  return (
    instructionsStore.instructionSuggestedByAI.data.classification.length === 0
  );
});

function handlePopoverOpenChange(open: boolean) {
  if (open && triggerDisabled.value) {
    isPopoverOpen.value = false;
    return;
  }
  isPopoverOpen.value = open;
}

function applySuggestion() {
  emit('applySuggestion', aiSuggestion.value);
  isPopoverOpen.value = false;
}
</script>

<style lang="scss">
.instruction-ai-suggestion {
  position: absolute;
  right: $unnnic-space-4;
  bottom: $unnnic-space-3;
}

.instruction-ai-suggestion__suggestion-applied {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-1;

  font: $unnnic-font-body;
  color: $unnnic-color-fg-success;
}

.instruction-ai-suggestion__trigger {
  font: $unnnic-font-action;
  color: $unnnic-color-fg-active;

  &--disabled {
    color: $unnnic-color-fg-muted;
    cursor: not-allowed;
  }
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
