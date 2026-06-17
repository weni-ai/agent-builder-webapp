<template>
  <UnnnicDrawerNext
    :open="instructionsStore.isInstructionDrawerOpen"
    lazyMount
    @update:open="onOpenChange"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="new-instruction-drawer-title">
          {{ title }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section class="new-instruction-drawer">
        <NewInstructionDrawerForm data-testid="new-instruction-drawer-form" />

        <section
          v-if="showStandaloneCategory"
          class="new-instruction-drawer__category"
          data-testid="new-instruction-drawer-category"
        >
          <p class="new-instruction-drawer__category-label">
            {{
              $t('agents.instructions.new_instruction_drawer.category_label')
            }}
          </p>

          <SuggestedCategory />
        </section>

        <NewInstructionDrawerAIAnalysis
          v-if="instructionsStore.instructionSuggestedByAI.status"
          data-testid="new-instruction-drawer-ai-analysis"
        />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            data-testid="new-instruction-drawer-cancel-button"
            :text="$t('agents.instructions.new_instruction_drawer.cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          data-testid="new-instruction-drawer-save-button"
          :text="$t('agents.instructions.new_instruction_drawer.save')"
          type="primary"
          :disabled="saveDisabled"
          :loading="instructionsStore.newInstruction.status === 'loading'"
          @click="save"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import NewInstructionDrawerForm from './Form.vue';
import NewInstructionDrawerAIAnalysis from './AIAnalysis.vue';
import SuggestedCategory from './SuggestedCategory.vue';

import { useInstructionsStore } from '@/store/Instructions';

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const isEditing = computed(
  () => instructionsStore.instructionDrawerMode === 'edit',
);

const showStandaloneCategory = computed(
  () => isEditing.value && !instructionsStore.instructionSuggestedByAI.status,
);

const title = computed(() =>
  t(
    `agents.instructions.new_instruction_drawer.${
      isEditing.value ? 'edit_title' : 'title'
    }`,
  ),
);

const saveDisabled = computed(() => {
  if (!instructionsStore.newInstruction.text.trim()) return true;

  const aiStatus = instructionsStore.instructionSuggestedByAI.status;

  if (isEditing.value) {
    return aiStatus === 'loading' || aiStatus === 'error';
  }

  return aiStatus !== 'complete';
});

function close() {
  instructionsStore.closeInstructionDrawer();
}

function onOpenChange(open) {
  if (!open) close();
}

async function save() {
  if (saveDisabled.value) return;

  if (isEditing.value) {
    await instructionsStore.updateEditingInstruction();
  } else {
    await instructionsStore.addInstruction();
  }

  if (instructionsStore.newInstruction.status === 'error') return;

  close();
}
</script>

<style lang="scss" scoped>
.new-instruction-drawer {
  height: 100%;

  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__category {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__category-label {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
