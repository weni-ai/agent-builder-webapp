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
      :loading="isNextLoading || (isSubmitting && step === TOTAL_STEPS)"
      :disabled="isNextDisabled"
      @click="handleNext"
    />
  </UnnnicDialogFooter>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { AgentGroup, AgentMCP, AgentSystem } from '@/store/types/Agents.types';

import useOfficialAgentAssignment, {
  type MCPConfigValues,
} from '@/composables/useOfficialAgentAssignment';

import FirstStepContent from './FirstStepContent.vue';
import SecondStepContent from './SecondStepContent/index.vue';
import nexusaiAPI from '@/api/nexusaiAPI';

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
const isNextLoading = ref(false);

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
  2: SecondStepContent,
};

const agentDetails = ref<AgentGroup | null>(props.agent);
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
  if (step.value === 2) {
    return {
      MCPs: agentDetails.value?.MCPs || [],
      selectedMCP: config.value.MCP,
      selectedMCPConfigValues: config.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        config.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConfigValues': (nextValues: MCPConfigValues) => {
        config.value.mcp_config = nextValues;
      },
    };
  }
  if (step.value === 3) {
    return {
      credentials: props.agent.credentials || [],
    };
  }
  return {};
});
const isNextDisabled = computed(() => {
  if (step.value === 2) {
    return !config.value.MCP;
  }
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
async function getAgentDetails() {
  const agentUuid = props.agent.variants.find(
    (v) =>
      v.variant.toUpperCase() === 'DEFAULT' &&
      config.value.system.toLowerCase() === v.systems[0].toLowerCase(),
  )?.uuid;
  if (!agentUuid) return;

  const agentDetailsData =
    await nexusaiAPI.router.agents_team.getOfficialAgentDetails(agentUuid);
  agentDetails.value = { ...props.agent, ...agentDetailsData };
}
async function handleNext() {
  if (isSubmitting.value) return;
  if (step.value < TOTAL_STEPS) {
    if (step.value === 1) {
      isNextLoading.value = true;
      await getAgentDetails();
      isNextLoading.value = false;
    }
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
