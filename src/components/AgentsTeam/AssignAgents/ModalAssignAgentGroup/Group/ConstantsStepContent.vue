<template>
  <section
    class="modal-assign-agent__constants-step"
    data-testid="constants-step"
  >
    <p class="modal-assign-agent__constants-step-title">
      {{ $t('agents.assign_agents.setup.constants.title', { agent: agentName }) }}
    </p>

    <ConstantsForm
      v-if="constants?.length"
      v-model:constantsValues="constantsValues"
      :constants="constants"
      data-testid="constants-step-form"
    />

    <p
      v-else
      class="modal-assign-agent__constants-step-empty"
      data-testid="constants-step-empty"
    >
      {{ $t('agents.assign_agents.setup.constants.not_required') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import ConstantsForm from './ConstantsForm.vue';

import { AgentConstantField } from '@/store/types/Agents.types';

type ConstantValue = string | string[] | boolean;

defineOptions({
  name: 'ConstantsStepContent',
});

defineProps<{
  agentName: string;
  constants: AgentConstantField[];
}>();

const constantsValues = defineModel<Record<string, ConstantValue>>(
  'constantsValues',
  {
    required: true,
    default: () => ({}),
  },
);
</script>

<style scoped lang="scss">
.modal-assign-agent__constants-step {
  overflow: auto;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  padding: $unnnic-space-6;

  &-title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &-empty {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}
</style>
