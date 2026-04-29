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
  AgentGroup,
  AgentMCP,
} from '@/store/types/Agents.types';

import useOfficialAgentAssignment, {
  type MCPConfigValues,
} from '@/composables/useOfficialAgentAssignment';
import useCustomAgentAssignment, {
  type ConstantsValues,
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

const hasSystems = computed(() => {
  if (!isOfficial.value) return false;
  const systems = (resolvedAgentDetails.value as AgentGroup)?.systems;
  return Array.isArray(systems) && systems.length > 0;
});

const stepSequence = computed<StepKey[]>(() => {
  if (!isOfficial.value) {
    return [Step.Constants, Step.CustomCredentials];
  }
  return hasSystems.value
    ? [Step.System, Step.MCP, Step.Credentials]
    : [Step.MCP, Step.Credentials];
});
const totalSteps = computed(() => stepSequence.value.length);
const isNextLoading = ref(false);

const officialAgentRef = toRef(() => props.agent as AgentGroup);
const customAgentRef = toRef(() => props.agent as Agent);

const officialAssignment = isOfficial.value
  ? useOfficialAgentAssignment(officialAgentRef)
  : null;
const customAssignment = isOfficial.value
  ? null
  : useCustomAgentAssignment(customAgentRef);

const isSubmitting = computed(() =>
  isOfficial.value
    ? officialAssignment!.isSubmitting.value
    : customAssignment!.isSubmitting.value,
);

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

const officialStepProps = computed(() => {
  const config = officialAssignment!.config;
  const agentDetails = resolvedAgentDetails.value as AgentGroup;
  const selectedSystemMCPs =
    agentDetails?.MCPs?.filter((mcp) => mcp.system === config.value.system) ||
    [];

  return {
    [Step.System]: {
      systems: (props.agent as AgentGroup).systems,
      MCPs: agentDetails?.MCPs,
      selectedSystem: config.value.system,
      'onUpdate:selectedSystem': (nextSystem: string) => {
        config.value.system = nextSystem;
      },
    },
    [Step.MCP]: {
      MCPs: hasSystems.value ? selectedSystemMCPs : agentDetails?.MCPs,
      selectedMCP: config.value.MCP,
      selectedMCPConstantsValues: config.value.mcp_config,
      'onUpdate:selectedMCP': (nextMCP: AgentMCP | null) => {
        config.value.MCP = nextMCP;
      },
      'onUpdate:selectedMCPConstantsValues': (nextValues: MCPConfigValues) => {
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
  } as Partial<Record<StepKey, Record<string, unknown>>>;
});

const customStepProps = computed(() => {
  const config = customAssignment!.config;
  const customAgent = props.agent as Agent;

  return {
    [Step.Constants]: {
      agentName: customAgent.name,
      constants: customAgent.constants ?? [],
      constantsValues: config.value.constants,
      'onUpdate:constantsValues': (nextValues: ConstantsValues) => {
        config.value.constants = nextValues;
      },
    },
    [Step.CustomCredentials]: {
      credentials: customAgent.credentials ?? [],
      credentialValues: config.value.credentials,
      'onUpdate:credentialValues': (nextValues: Record<string, string>) => {
        config.value.credentials = nextValues;
      },
    },
  } as Partial<Record<StepKey, Record<string, unknown>>>;
});

const currentStepProps = computed(() => {
  const propsByStep = isOfficial.value
    ? officialStepProps.value
    : customStepProps.value;
  return propsByStep[currentStepKey.value] ?? {};
});

const isNextDisabled = computed(() => {
  const isSomeValueMissing = (
    values: Record<string, string | string[] | boolean>,
  ) => {
    return Object.values(values).some(
      (value) => value === '' || value === undefined,
    );
  };

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

  if (isOfficial.value) {
    const config = officialAssignment!.config;
    const stepDisabled: Partial<Record<StepKey, () => boolean>> = {
      [Step.MCP]: () =>
        !config.value.MCP ||
        isSomeRequiredFieldMissing(
          config.value.MCP?.constants,
          config.value.mcp_config,
        ),
      [Step.Credentials]: () =>
        isSomeValueMissing(config.value.credentials) || isSubmitting.value,
    };

    return stepDisabled[currentStepKey.value]?.();
  }

  const config = customAssignment!.config;
  const customAgent = props.agent as Agent;
  const stepDisabled: Partial<Record<StepKey, () => boolean>> = {
    [Step.Constants]: () =>
      isSomeRequiredFieldMissing(customAgent.constants, config.value.constants),
    [Step.CustomCredentials]: () =>
      isSomeValueMissing(config.value.credentials) || isSubmitting.value,
  };

  return stepDisabled[currentStepKey.value]?.();
});
function resetFlow() {
  stepIndex.value = 1;
  if (isOfficial.value) {
    officialAssignment!.resetAssignment();
  } else {
    customAssignment!.resetAssignment();
  }
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
  const submit = isOfficial.value
    ? officialAssignment!.submitAssignment
    : customAssignment!.submitAssignment;
  const hasFinished = await submit();
  if (hasFinished) {
    closeModal();
  }
}

const stepCleanupHandlers = computed<Partial<Record<StepKey, () => void>>>(
  () => {
    if (isOfficial.value) {
      const config = officialAssignment!.config;
      return {
        [Step.MCP]: () => {
          config.value.mcp_config = {};
          config.value.MCP = null;
        },
        [Step.Credentials]: () => {
          config.value.credentials = {};
          config.value.MCP = null;
        },
      };
    }

    const config = customAssignment!.config;
    return {
      [Step.Constants]: () => {
        config.value.constants = {};
      },
      [Step.CustomCredentials]: () => {
        config.value.credentials = {};
      },
    };
  },
);

function handleBack() {
  if (isSubmitting.value) return;

  stepCleanupHandlers.value[currentStepKey.value]?.();

  if (stepIndex.value > 1) {
    stepIndex.value--;
  } else {
    closeModal();
  }
}
</script>
