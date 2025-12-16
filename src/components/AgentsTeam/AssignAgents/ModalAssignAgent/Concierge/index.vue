<template>
  <UnnnicDialogHeader>
    <UnnnicDialogTitle>{{ agent?.name }}</UnnnicDialogTitle>

    <UnnnicTag
      :text="`Step ${step} of ${TOTAL_STEPS}`"
      scheme="gray"
      data-testid="step-tag"
    />
  </UnnnicDialogHeader>

  <component
    :is="stepComponents[step]"
    v-bind="currentStepProps"
  />

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
import { computed, ref } from 'vue';

import FirstStepContent from './FirstStepContent.vue';

import {
  AgentGroup,
  AgentSystem,
  ConciergeVariant,
} from '@/store/types/Agents.types';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const step = ref<number>(1);
const TOTAL_STEPS = 3;

const config = ref<{
  system: AgentSystem;
  variant: {
    type: ConciergeVariant | '';
    config: null;
  };
  credentials: string[];
}>({
  system: 'VTEX',
  variant: {
    type: '',
    config: null,
  },
  credentials: [],
});

const stepComponents = {
  1: FirstStepContent,
  // 2: SecondStepContent,
  // 3: ThirdStepContent,
};

const currentStepProps = computed(() => {
  if (step.value !== 1) return {};

  return {
    systems: props.agent.systems,
    selectedSystem: config.value.system,
    'onUpdate:selectedSystem': (nextSystem: AgentSystem) => {
      config.value.system = nextSystem;
    },
  };
});

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
