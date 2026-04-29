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
import { computed, ref, toRef, type Component, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  Agent,
  AgentConstantField,
  AgentCredential,
  AgentGroup,
  AgentMCP,
} from '@/store/types/Agents.types';

import useOfficialAgentAssignment, {
  type ConciergeAssignmentConfig,
  type MCPConfigValues,
} from '@/composables/useOfficialAgentAssignment';
import useCustomAgentAssignment, {
  type ConstantsValues,
  type CustomAssignmentConfig,
} from '@/composables/useCustomAgentAssignment';

import SystemStepContent from './SystemStepContent.vue';
import MCPStepContent from './MCPStepContent/index.vue';
import CredentialsStepContent from './CredentialsStepContent/index.vue';
import ConstantsStepContent from './ConstantsStepContent.vue';
import CustomCredentialsStepContent from './CustomCredentialsStepContent.vue';

const emit = defineEmits(['update:open']);

const props = defineProps<{
  agent: AgentGroup | Agent;
  agentDetails?: AgentGroup | Agent | null;
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
const resolvedAgentDetails = computed(() => props.agentDetails ?? props.agent);
const isOfficial = computed(() => Boolean(props.agent?.is_official));

const officialAgent = computed(() => props.agent as AgentGroup);
const customAgent = computed(() => props.agent as Agent);

const hasSystems = computed(() => {
  if (!isOfficial.value) return false;
  const systems =
    (resolvedAgentDetails.value as AgentGroup)?.systems ??
    officialAgent.value.systems;
  return Array.isArray(systems) && systems.length > 0;
});

const hasMCPs =
  isOfficial.value &&
  Array.isArray(officialAgent.value.MCPs) &&
  officialAgent.value.MCPs.length > 0;

const stepSequence = computed<StepKey[]>(() => {
  if (hasMCPs) {
    return hasSystems.value
      ? [Step.System, Step.MCP, Step.Credentials]
      : [Step.MCP, Step.Credentials];
  }
  const steps: StepKey[] = [];
  if (customAgent.value.constants?.length) steps.push(Step.Constants);
  if (customAgent.value.credentials?.length) steps.push(Step.CustomCredentials);
  return steps;
});

const totalSteps = computed(() => stepSequence.value.length);
const isNextLoading = ref(false);

const { config, isSubmitting, resetAssignment, submitAssignment } = hasMCPs
  ? useOfficialAgentAssignment(toRef(() => officialAgent.value))
  : useCustomAgentAssignment(toRef(() => customAgent.value));

const officialConfig = config as Ref<ConciergeAssignmentConfig>;
const customConfig = config as Ref<CustomAssignmentConfig>;

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
  const officialDetails = resolvedAgentDetails.value as AgentGroup | undefined;
  const selectedSystemMCPs =
    officialDetails?.MCPs?.filter(
      (mcp) => mcp.system === officialConfig.value.system,
    ) || [];

  const stepProps: Partial<Record<StepKey, Record<string, unknown>>> = {
    [Step.System]: {
      systems: officialAgent.value.systems,
      MCPs: officialDetails?.MCPs,
      selectedSystem: officialConfig.value.system,
      'onUpdate:selectedSystem': (nextSystem: string) => {
        officialConfig.value.system = nextSystem;
      },
    },
    [Step.MCP]: {
      MCPs: hasSystems.value ? selectedSystemMCPs : officialDetails?.MCPs,
      selectedMCP: officialConfig.value.MCP,
      selectedMCPConstantsValues: officialConfig.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        officialConfig.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConstantsValues': (nextValues: MCPConfigValues) => {
        officialConfig.value.mcp_config = nextValues;
      },
    },
    [Step.Credentials]: {
      selectedSystem: officialConfig.value.system,
      selectedMCP: officialConfig.value.MCP,
      credentialValues: officialConfig.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        officialConfig.value.credentials = nextValues;
      },
    },
    [Step.Constants]: {
      agentName: customAgent.value.name,
      constants: customAgent.value.constants ?? [],
      constantsValues: customConfig.value.constants,
      'onUpdate:constantsValues': (nextValues: ConstantsValues) => {
        customConfig.value.constants = nextValues;
      },
    },
    [Step.CustomCredentials]: {
      credentials: customAgent.value.credentials ?? [],
      credentialValues: customConfig.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        customConfig.value.credentials = nextValues;
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
    [Step.MCP]: () =>
      !officialConfig.value.MCP ||
      isSomeRequiredFieldMissing(
        officialConfig.value.MCP?.constants,
        officialConfig.value.mcp_config,
      ),
    [Step.Credentials]: () =>
      !areAllCredentialsFilled(
        officialConfig.value.MCP?.credentials,
        officialConfig.value.credentials,
      ) || isSubmitting.value,
    [Step.Constants]: () =>
      isSomeRequiredFieldMissing(
        customAgent.value.constants,
        customConfig.value.constants,
      ),
    [Step.CustomCredentials]: () =>
      !areAllCredentialsFilled(
        customAgent.value.credentials,
        customConfig.value.credentials,
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
    officialConfig.value.mcp_config = {};
    officialConfig.value.MCP = null;
  },
  [Step.Credentials]: () => {
    officialConfig.value.credentials = {};
    officialConfig.value.MCP = null;
  },
  [Step.Constants]: () => {
    customConfig.value.constants = {};
  },
  [Step.CustomCredentials]: () => {
    customConfig.value.credentials = {};
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
