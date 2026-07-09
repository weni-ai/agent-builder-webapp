<template>
  <section class="suggested-rewrite">
    <p class="suggested-rewrite__suggestion">“{{ data.suggestion }}”</p>

    <footer class="suggested-rewrite__footer">
      <section
        v-if="suggestionApplied"
        class="suggested-rewrite__suggestion-applied"
      >
        <UnnnicIcon
          icon="check_circle"
          size="avatar-nano"
          scheme="fg-success"
        />
        {{ suggestionT('suggestion_applied') }}
      </section>

      <UnnnicButton
        v-if="suggestionApplied"
        type="secondary"
        iconLeft="undo"
        :text="suggestionT('undo_button')"
        @click="undoSuggestion"
      />

      <UnnnicButton
        v-else
        type="secondary"
        :text="suggestionT('apply_button')"
        @click="applySuggestion"
      />
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';
import type { Classification } from '@/store/types/Instructions.types';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const suggestionT = (key: string) =>
  t(`agents.instructions.new_instruction_drawer.ai_analysis.${key}`);

const { data, suggestionApplied } = toRefs(
  instructionsStore.instructionSuggestedByAI,
);

const textBeforeSuggestion = ref('');
const classificationBeforeSuggestion = ref<Classification[] | []>([]);

function applySuggestion() {
  textBeforeSuggestion.value = instructionsStore.newInstruction.text;
  classificationBeforeSuggestion.value = data.value.classification;
  instructionsStore.newInstruction.text = data.value.suggestion;
  data.value.classification = [];
  suggestionApplied.value = data.value.suggestion;
}

function undoSuggestion() {
  instructionsStore.newInstruction.text = textBeforeSuggestion.value;
  data.value.classification = classificationBeforeSuggestion.value;
  textBeforeSuggestion.value = '';
  classificationBeforeSuggestion.value = [];
  suggestionApplied.value = '';
}
</script>

<style lang="scss" scoped>
.suggested-rewrite {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__suggestion {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-emphasized;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: $unnnic-space-4;
  }

  &__suggestion-applied {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;

    font: $unnnic-font-action;
    color: $unnnic-color-fg-success;
  }
}
</style>
