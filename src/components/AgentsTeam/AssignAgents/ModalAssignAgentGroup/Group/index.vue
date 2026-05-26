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

import {
  Agent,
  AgentConstantField,
  AgentCredential,
  AgentMCP,
} from '@/store/types/Agents.types';

import useAgentAssignment, {
  type AssignmentValues,
} from '@/composables/useAgentAssignment';

import SystemStepContent from './SystemStepContent.vue';
import MCPStepContent from './MCPStepContent/index.vue';
import CredentialsStepContent from './CredentialsStepContent/index.vue';
import ConstantsStepContent from './ConstantsStepContent.vue';
import CustomCredentialsStepContent from './CustomCredentialsStepContent.vue';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: Agent;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

const Step = {
  System: 'system',
  MCP: 'mcp',
  Credentials: 'credentials',
  Constants: 'constants',
  CustomCredentials: 'custom_credentials',
} as const;
type StepKey = (typeof Step)[keyof typeof Step];

const stepIndex = ref<number>(1);
const isOfficial = computed(() => Boolean(props.agent?.is_official));

const agentConstants = computed(() => props.agent.mcps?.[0]?.config ?? []);
const agentCredentials = computed(
  () => props.agent.mcps?.[0]?.credentials ?? [],
);

const hasSystems = computed(() => {
  if (!isOfficial.value) return false;
  const systems = props.agent.systems;
  return Array.isArray(systems) && systems.length > 0;
});

const hasMCPs =
  isOfficial.value &&
  Array.isArray(props.agent.mcps) &&
  props.agent.mcps.length > 0;

const stepSequence = computed<StepKey[]>(() => {
  if (hasMCPs) {
    return hasSystems.value
      ? [Step.System, Step.MCP, Step.Credentials]
      : [Step.MCP, Step.Credentials];
  }
  const steps: StepKey[] = [];
  if (agentConstants.value.length) steps.push(Step.Constants);
  if (agentCredentials.value.length) steps.push(Step.CustomCredentials);
  return steps;
});

const totalSteps = computed(() => stepSequence.value.length);
const isNextLoading = ref(false);

const { config, isSubmitting, resetAssignment, submitAssignment } =
  useAgentAssignment(toRef(() => props.agent));

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
  [Step.Constants]: ConstantsStepContent,
  [Step.CustomCredentials]: CustomCredentialsStepContent,
};

const currentStepKey = computed<StepKey>(
  () => stepSequence.value[stepIndex.value - 1],
);
const currentStepProps = computed(() => {
  const selectedSystemMCPs =
    props.agent?.mcps?.filter((mcp) => mcp.system === config.value.system) ||
    [];

  const stepProps: Partial<Record<StepKey, Record<string, unknown>>> = {
    [Step.System]: {
      systems: props.agent.systems,
      MCPs: props.agent.mcps,
      selectedSystem: config.value.system,
      'onUpdate:selectedSystem': (nextSystem: string) => {
        config.value.system = nextSystem;
      },
    },
    [Step.MCP]: {
      MCPs: hasSystems.value ? selectedSystemMCPs : props.agent.mcps,
      selectedMCP: config.value.MCP,
      selectedMCPConstantsValues: config.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        config.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConstantsValues': (nextValues: AssignmentValues) => {
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
    [Step.Constants]: {
      agentName: props.agent.name,
      constants: agentConstants.value,
      constantsValues: config.value.mcp_config,
      'onUpdate:constantsValues': (nextValues: AssignmentValues) => {
        config.value.mcp_config = nextValues;
      },
    },
    [Step.CustomCredentials]: {
      credentials: agentCredentials.value,
      credentialValues: config.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        config.value.credentials = nextValues;
      },
    },
  };

  return stepProps[currentStepKey.value] ?? {};
});
const isNextDisabled = computed(() => {
  const isSomeRequiredFieldMissing = (
    fields: AgentConstantField[] = [],
    values: Record<string, string | string[] | boolean> = {},
  ) => {
    const requiredFieldNames = fields
      .filter((field) => field.is_required)
      .map((field) => field.name);

    return requiredFieldNames.some((name) => {
      const value = values[name];
      return value === '' || value === undefined;
    });
  };

  const areAllCredentialsFilled = (
    fields: AgentCredential[] = [],
    values: Record<string, string> = {},
  ) => {
    return fields.every((field) => {
      const value = values[field.name];
      return value !== '' && value !== undefined;
    });
  };

  const stepDisabled: Partial<Record<StepKey, () => boolean>> = {
    [Step.System]: () => !config.value.system,
    [Step.MCP]: () =>
      !config.value.MCP ||
      isSomeRequiredFieldMissing(
        config.value.MCP?.config,
        config.value.mcp_config,
      ),
    [Step.Credentials]: () =>
      !areAllCredentialsFilled(
        config.value.MCP?.credentials,
        config.value.credentials,
      ) || isSubmitting.value,
    [Step.Constants]: () =>
      isSomeRequiredFieldMissing(agentConstants.value, config.value.mcp_config),
    [Step.CustomCredentials]: () =>
      !areAllCredentialsFilled(
        agentCredentials.value,
        config.value.credentials,
      ) || isSubmitting.value,
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
  [Step.Constants]: () => {
    config.value.mcp_config = {};
  },
  [Step.CustomCredentials]: () => {
    config.value.credentials = {};
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
