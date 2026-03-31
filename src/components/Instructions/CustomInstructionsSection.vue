<template>
  <section class="custom-instructions-section">
    <header class="custom-instructions-section__header">
      <UnnnicInput
        v-model="searchTerm"
        iconLeft="search"
        :placeholder="
          $t('agent_builder.instructions.instructions_list.search_placeholder')
        "
        class="custom-instructions-section__search"
        data-testid="custom-instructions-search"
      />
      <UnnnicButton
        :text="
          $t('agent_builder.instructions.instructions_list.copy_instructions')
        "
        type="secondary"
        iconLeft="content_copy"
        class="custom-instructions-section__copy-button"
        data-testid="copy-instructions-button"
        @click="copyInstructionsToClipboard"
      />
    </header>

    <InstructionsList
      data-testid="instructions-custom"
      :instructions="filteredInstructions"
      :isLoading="instructionsStore.instructions.status === 'loading'"
      showActions
      :noInstructionsText="noInstructionsText"
    />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useInstructionsStore } from '@/store/Instructions';
import { useAlertStore } from '@/store/Alert';
import i18n from '@/utils/plugins/i18n';

import InstructionsList from './InstructionsList.vue';

const instructionsStore = useInstructionsStore();
const alertStore = useAlertStore();

const searchTerm = ref('');

const noInstructionsText = computed(() => {
  return searchTerm.value.trim()
    ? i18n.global.t(
        'agent_builder.instructions.instructions_list.no_custom_instructions_found',
      )
    : undefined;
});

const filteredInstructions = computed(() => {
  const data = instructionsStore.instructions.data ?? [];
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return data;
  return data.filter((instruction) =>
    (instruction.text ?? '').toLowerCase().includes(term),
  );
});

async function copyInstructionsToClipboard() {
  const texts = filteredInstructions.value
    .map((instruction) => instruction.text)
    .filter(Boolean);
  const content = texts.join('\n\n');
  if (!content) return;
  try {
    await navigator.clipboard.writeText(content);
    alertStore.add({
      type: 'success',
      text: i18n.global.t(
        'agent_builder.instructions.instructions_list.copy_success',
      ),
    });
  } catch {
    alertStore.add({
      type: 'error',
      text: i18n.global.t(
        'agent_builder.instructions.instructions_list.copy_error',
      ),
    });
  }
}
</script>

<style lang="scss" scoped>
.custom-instructions-section {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__header {
    display: flex;
    gap: $unnnic-space-4;
    align-items: center;
  }

  &__search {
    width: 100%;
  }

  &__copy-button {
    width: calc(100% / 12 * 2.5);
  }
}
</style>
