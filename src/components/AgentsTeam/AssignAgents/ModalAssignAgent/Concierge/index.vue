<template>
  <UnnnicDialogHeader>
    <UnnnicDialogTitle>{{
      $t('agents.assign_agents.setup.step.title', { agent: agent?.name })
    }}</UnnnicDialogTitle>

    <UnnnicTag
      :text="
        $t('agents.assign_agents.setup.step.tag', { step, total: TOTAL_STEPS })
      "
      scheme="gray"
    />
  </UnnnicDialogHeader>

  <component
    :is="stepComponents[step]"
    v-bind="currentStepProps"
  />

  <UnnnicDialogFooter>
    <UnnnicButton
      :text="leftButtonText"
      type="secondary"
      @click="handleBack"
    />

    <UnnnicButton
      :text="rightButtonText"
      :loading="isSubmitting && step === TOTAL_STEPS"
      :disabled="isNextDisabled"
      @click="handleNext"
    />
  </UnnnicDialogFooter>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import FirstStepContent from './FirstStepContent.vue';

import { AgentGroup, AgentSystem } from '@/store/types/Agents.types';

import useOfficialAgentAssignment from '@/composables/useOfficialAgentAssignment';
import { useI18n } from 'vue-i18n';

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
const agentRef = toRef(props, 'agent');

const { config, isSubmitting, resetAssignment, submitAssignment } =
  useOfficialAgentAssignment(agentRef);

const { t } = useI18n();
const setupTranslations = (key: string) =>
  t(`agents.assign_agents.setup.${key}`);

const leftButtonText = computed(() => {
  return step.value === 1
    ? setupTranslations('cancel_button')
    : setupTranslations('back_button');
});
const rightButtonText = computed(() => {
  return step.value === TOTAL_STEPS
    ? setupTranslations('finish_button')
    : setupTranslations('next_button');
});

const stepComponents = {
  1: FirstStepContent,
};

const currentStepProps = computed(() => {
  if (step.value === 1) {
    return {
      systems: props.agent.systems,
      selectedSystem: config.value.system,
      'onUpdate:selectedSystem': (nextSystem: AgentSystem) => {
        config.value.system = nextSystem;
      },
    };
  }

  return {};
});

const isNextDisabled = computed(() => {
  if (step.value === TOTAL_STEPS) {
    return isSubmitting.value;
  }

  return false;
});

function resetFlow() {
  step.value = 1;
  resetAssignment();
}

function closeModal() {
  emit('update:open', false);
  resetFlow();
}

async function handleNext() {
  if (isSubmitting.value) return;

  if (step.value < TOTAL_STEPS) {
    step.value++;
    return;
  }

  const hasFinished = await submitAssignment();

  if (hasFinished) {
    closeModal();
  }
}

function handleBack() {
  if (isSubmitting.value) return;

  if (step.value > 1) {
    step.value--;
  } else {
    closeModal();
  }
}
</script>
