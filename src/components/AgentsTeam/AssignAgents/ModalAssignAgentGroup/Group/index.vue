<template>
  <UnnnicDialogHeader>
    <UnnnicDialogTitle>{{
      $t('agents.assign_agents.setup.step.title', { agent: agent?.name })
    }}</UnnnicDialogTitle>

    <UnnnicTag
      :text="
        $t('agents.assign_agents.setup.step.tag', {
          step: stepIndex,
          total: totalSteps,
        })
      "
      scheme="gray"
    />
  </UnnnicDialogHeader>

  <component
    :is="stepComponents[currentStepKey]"
    v-bind="currentStepProps"
  />

  <UnnnicDialogFooter>
    <UnnnicButton
      :text="leftButtonText"
      type="secondary"
      data-testid="modal-concierge-left-button"
      @click="handleBack"
    />

    <UnnnicButton
      :text="rightButtonText"
      :loading="isNextLoading || (isSubmitting && stepIndex === totalSteps)"
      :disabled="isNextDisabled"
      data-testid="modal-concierge-right-button"
      @click="handleNext"
    />
  </UnnnicDialogFooter>
</template>

<script setup lang="ts">
import { computed, ref, toRef, type Component } from 'vue';
import { useI18n } from 'vue-i18n';

import { AgentGroup, AgentMCP } from '@/store/types/Agents.types';

import useOfficialAgentAssignment, {
  type MCPConfigValues,
} from '@/composables/useOfficialAgentAssignment';

import SystemStepContent from './SystemStepContent.vue';
import MCPStepContent from './MCPStepContent/index.vue';
import CredentialsStepContent from './CredentialsStepContent/index.vue';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup;
  agentDetails?: AgentGroup | null;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const Step = {
  System: 'system',
  MCP: 'mcp',
  Credentials: 'credentials',
} as const;
type StepKey = (typeof Step)[keyof typeof Step];

const stepIndex = ref<number>(1);
const resolvedAgentDetails = computed(() => props.agentDetails ?? props.agent);
const hasSystems = computed(() => {
  const systems = resolvedAgentDetails.value?.systems ?? props.agent.systems;
  return Array.isArray(systems) && systems.length > 0;
});
const stepSequence = computed<StepKey[]>(() =>
  hasSystems.value
    ? [Step.System, Step.MCP, Step.Credentials]
    : [Step.MCP, Step.Credentials],
);
const totalSteps = computed(() => stepSequence.value.length);
const agentRef = toRef(props, 'agent');
const isNextLoading = ref(false);

const { config, isSubmitting, resetAssignment, submitAssignment } =
  useOfficialAgentAssignment(agentRef);

const { t } = useI18n();
const setupTranslations = (key: string) =>
  t(`agents.assign_agents.setup.${key}`);

const leftButtonText = computed(() => {
  return stepIndex.value === 1
    ? setupTranslations('cancel_button')
    : setupTranslations('back_button');
});
const rightButtonText = computed(() => {
  return stepIndex.value === totalSteps.value
    ? setupTranslations('finish_button')
    : setupTranslations('next_button');
});

const stepComponents: Record<StepKey, Component> = {
  [Step.System]: SystemStepContent,
  [Step.MCP]: MCPStepContent,
  [Step.Credentials]: CredentialsStepContent,
};

const currentStepKey = computed<StepKey>(
  () => stepSequence.value[stepIndex.value - 1],
);
const currentStepProps = computed(() => {
  const selectedSystemMCPs =
    resolvedAgentDetails.value?.MCPs.filter(
      (mcp) => mcp.system === config.value.system,
    ) || [];

  const stepProps: Record<StepKey, Record<string, unknown>> = {
    [Step.System]: {
      systems: props.agent.systems,
      MCPs: resolvedAgentDetails.value?.MCPs,
      selectedSystem: config.value.system,
      'onUpdate:selectedSystem': (nextSystem: string) => {
        config.value.system = nextSystem;
      },
    },
    [Step.MCP]: {
      MCPs: hasSystems.value
        ? selectedSystemMCPs
        : resolvedAgentDetails.value?.MCPs,
      selectedMCP: config.value.MCP,
      selectedMCPConfigValues: config.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        config.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConfigValues': (nextValues: MCPConfigValues) => {
        config.value.mcp_config = nextValues;
      },
    },
    [Step.Credentials]: {
      selectedSystem: config.value.system,
      selectedMCP: config.value.MCP,
      credentialValues: config.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        config.value.credentials = nextValues;
      },
    },
  };

  return stepProps[currentStepKey.value] ?? {};
});
const isNextDisabled = computed(() => {
  const isSomeValueMissing = (
    values: Record<string, string | string[] | boolean>,
  ) => {
    return Object.values(values).some(
      (value) => value === '' || value === undefined,
    );
  };

  const stepDisabled: Partial<Record<StepKey, () => boolean>> = {
    [Step.MCP]: () => {
      return !config.value.MCP || isSomeValueMissing(config.value.mcp_config);
    },
    [Step.Credentials]: () => {
      return isSomeValueMissing(config.value.credentials) || isSubmitting.value;
    },
  };

  return stepDisabled[currentStepKey.value]?.();
});
function resetFlow() {
  stepIndex.value = 1;
  resetAssignment();
}
function closeModal() {
  emit('update:open', false);
  resetFlow();
}
async function handleNext() {
  if (isSubmitting.value) return;
  if (stepIndex.value < totalSteps.value) {
    stepIndex.value++;
    return;
  }
  const hasFinished = await submitAssignment();
  if (hasFinished) {
    closeModal();
  }
}

const stepCleanupHandlers: Partial<Record<StepKey, () => void>> = {
  [Step.MCP]: () => {
    config.value.mcp_config = {};
    config.value.MCP = null;
  },
  [Step.Credentials]: () => {
    config.value.credentials = {};
    config.value.MCP = null;
  },
};

function handleBack() {
  if (isSubmitting.value) return;

  stepCleanupHandlers[currentStepKey.value]?.();

  if (stepIndex.value > 1) {
    stepIndex.value--;
  } else {
    closeModal();
  }
}
</script>
