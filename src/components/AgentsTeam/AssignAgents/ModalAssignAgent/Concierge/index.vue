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
      :loading="isNextLoading || (isSubmitting && step === TOTAL_STEPS)"
      :disabled="isNextDisabled"
      @click="handleNext"
    />
  </UnnnicDialogFooter>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue';

import FirstStepContent from './FirstStepContent.vue';
import SecondStepContent from './SecondStepContent.vue';
import ThirdStepContent from './ThirdStepContent.vue';

import { AgentGroup, AgentMCP, AgentSystem } from '@/store/types/Agents.types';

import useOfficialAgentAssignment, {
  type MCPConfigValues,
} from '@/composables/useOfficialAgentAssignment';
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
const {
  config,
  isSubmitting,
  ensureCredentialsLoaded,
  resetAssignment,
  submitAssignment,
} = useOfficialAgentAssignment(agentRef);

onMounted(ensureCredentialsLoaded);

const stepComponents = {
  1: FirstStepContent,
  2: SecondStepContent,
  3: ThirdStepContent,
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
  const agentDetailsData = await nexusaiAPI.router.agents_team.getAgentDetails(
    props.agent.variants.find(
      (v) =>
        v.variant.toUpperCase() === 'DEFAULT' &&
        config.value.system === v.systems[0],
    )?.uuid,
  );

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
