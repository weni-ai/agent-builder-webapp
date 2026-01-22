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
      data-testid="modal-concierge-left-button"
      @click="handleBack"
    />

    <UnnnicButton
      :text="rightButtonText"
      :loading="isNextLoading || (isSubmitting && step === TOTAL_STEPS)"
      :disabled="isNextDisabled"
      data-testid="modal-concierge-right-button"
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
import ThirdStepContent from './ThirdStepContent/index.vue';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup;
  agentDetails?: AgentGroup | null;
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
  3: ThirdStepContent,
};

const resolvedAgentDetails = computed(() => props.agentDetails ?? props.agent);
const currentStepProps = computed(() => {
  const selectedSystemMCPs =
    resolvedAgentDetails.value?.MCPs.filter(
      (mcp) => mcp.system === config.value.system,
    ) || [];

  const stepProps = {
    1: {
      systems: props.agent.systems,
      selectedSystem: config.value.system,
      'onUpdate:selectedSystem': (nextSystem: AgentSystem) => {
        config.value.system = nextSystem;
      },
    },
    2: {
      MCPs: selectedSystemMCPs,
      selectedMCP: config.value.MCP,
      selectedMCPConfigValues: config.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        config.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConfigValues': (nextValues: MCPConfigValues) => {
        config.value.mcp_config = nextValues;
      },
    },
    3: {
      selectedSystem: config.value.system,
      selectedMCP: config.value.MCP,
      credentialValues: config.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        config.value.credentials = nextValues;
      },
    },
  };

  return stepProps[step.value];
});
const isNextDisabled = computed(() => {
  const isSomeValueMissing = (
    values: Record<string, string | string[] | boolean>,
  ) => {
    return Object.values(values).some(
      (value) => value === '' || value === undefined,
    );
  };

  const stepDisabled = {
    2: () => {
      return !config.value.MCP || isSomeValueMissing(config.value.mcp_config);
    },
    3: () => {
      return isSomeValueMissing(config.value.credentials) || isSubmitting.value;
    },
  };

  return stepDisabled[step.value]?.();
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

const stepCleanupHandlers: Record<number, () => void> = {
  2: () => {
    config.value.mcp_config = {};
    config.value.MCP = null;
  },
  3: () => {
    config.value.credentials = {};
    config.value.MCP = null;
  },
};

function handleBack() {
  if (isSubmitting.value) return;

  stepCleanupHandlers[step.value]?.();

  if (step.value > 1) {
    step.value--;
  } else {
    closeModal();
  }
}
</script>
