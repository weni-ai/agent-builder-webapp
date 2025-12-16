<template>
  <UnnnicDialogHeader>
    <UnnnicDialogTitle>{{ agent?.name }}</UnnnicDialogTitle>

    <UnnnicTag
      :text="`Step ${step} of ${TOTAL_STEPS}`"
      scheme="gray"
      data-testid="step-tag"
    />
  </UnnnicDialogHeader>

  <UnnnicDialogFooter>
    <UnnnicButton
      :text="step === 1 ? 'Cancel' : 'Back'"
      type="secondary"
      data-testid="cancel-button"
      @click="handleBack"
    />

    <UnnnicButton
      :text="step === TOTAL_STEPS ? 'Finish' : 'Next'"
      data-testid="next-button"
      @click="handleNext"
    />
  </UnnnicDialogFooter>
</template>

<script setup lang="ts">
import { AgentGroupOrAgent } from '@/store/types/Agents.types';
import { ref } from 'vue';

const emit = defineEmits(['update:open']);

defineProps<{
  agent: AgentGroupOrAgent;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const step = ref<number>(1);
const TOTAL_STEPS = 3;

function closeModal() {
  emit('update:open', false);
}

function handleNext() {
  if (step.value < TOTAL_STEPS) {
    step.value++;
  } else {
    closeModal();
  }
}

function handleBack() {
  if (step.value > 1) {
    step.value--;
  } else {
    closeModal();
  }
}
</script>
