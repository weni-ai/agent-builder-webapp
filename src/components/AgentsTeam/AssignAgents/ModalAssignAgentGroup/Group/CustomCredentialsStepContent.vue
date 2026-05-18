<template>
  <section
    class="modal-assign-agent__custom-credentials-step"
    data-testid="custom-credentials-step"
  >
    <p class="modal-assign-agent__custom-credentials-step-title">
      {{ $t('agents.assign_agents.setup.custom_credentials.title') }}
    </p>

    <Credentials
      v-model:credentialValues="credentialValues"
      :credentials="credentials"
      data-testid="custom-credentials-step-credentials"
    />
  </section>
</template>

<script setup lang="ts">
import Credentials from './CredentialsStepContent/Credentials.vue';

import { AgentCredential } from '@/store/types/Agents.types';

defineOptions({
  name: 'CustomCredentialsStepContent',
});

defineProps<{
  credentials: AgentCredential[];
}>();

const credentialValues = defineModel<Record<string, string>>(
  'credentialValues',
  {
    required: true,
    default: () => ({}),
  },
);
</script>

<style scoped lang="scss">
.modal-assign-agent__custom-credentials-step {
  overflow: auto;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  padding: $unnnic-space-6;

  &-title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }
}
</style>
