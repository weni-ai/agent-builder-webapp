<template>
  <UnnnicDrawerNext
    v-model:open="modelValue"
    lazyMount
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="new-instruction-drawer-title">{{
          $t('agents.instructions.new_instruction_drawer.title')
        }}</UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section class="new-instruction-drawer">
        <NewInstructionDrawerForm data-testid="new-instruction-drawer-form" />

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

import NewInstructionDrawerForm from './Form.vue';
import NewInstructionDrawerAIAnalysis from './AIAnalysis.vue';

import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const saveDisabled = computed(
  () =>
    !instructionsStore.newInstruction.text.trim() ||
    instructionsStore.instructionSuggestedByAI.status !== 'complete',
);

function close() {
  modelValue.value = false;
}

async function save() {
  if (saveDisabled.value) return;

  await instructionsStore.addInstruction();

  if (instructionsStore.newInstruction.status === 'error') return;

  instructionsStore.resetInstructionSuggestedByAI();
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
}
</style>
