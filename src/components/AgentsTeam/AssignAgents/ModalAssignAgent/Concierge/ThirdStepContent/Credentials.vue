<template>
  <section
    v-if="hasCredentials"
    class="modal-assign-agent__credentials"
  >
    <UnnnicDisclaimer
      v-if="credentialsWithValue.length"
      type="neutral"
      :title="
        $t('agents.assign_agents.setup.third_step.credentials.disclaimer_title')
      "
      :description="formattedUsedCredentials"
    />

    <template v-if="credentialsWithoutValue.length">
      <UnnnicFormElement
        v-for="credential in credentialsWithoutValue"
        :key="credential.name"
        :label="credential.label"
        class="modal-assign-agent__credentials-field"
      >
        <UnnnicInput
          :modelValue="getCredentialValue(credential.name)"
          :placeholder="credential.placeholder || credential.label"
          :nativeType="credential.is_confidential ? 'password' : 'text'"
          @update:model-value="(value) => handleInputChange(credential, value)"
        />
      </UnnnicFormElement>
    </template>
  </section>

  <p
    v-else
    class="modal-assign-agent__credentials-not-required"
  >
    {{ $t('agents.assign_agents.setup.third_step.credentials.not_required') }}
  </p>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { AgentCredential } from '@/store/types/Agents.types';
import { formatListToReadable } from '@/utils/formatters';

const props = defineProps<{
  credentials: AgentCredential[];
}>();

const credentialValues = defineModel<Record<string, string>>(
  'credentialValues',
  {
    required: true,
    default: () => ({}),
  },
);

const tuningsStore = useTuningsStore();

onMounted(() => {
  if (
    !tuningsStore.credentials.data &&
    tuningsStore.credentials.status !== 'loading'
  ) {
    tuningsStore.fetchCredentials();
  }
});

const hasCredentials = computed(() => Boolean(props.credentials?.length));

const credentialsWithoutValue = computed(() => {
  return (
    props.credentials?.filter((credential) => {
      const storedValue = getStoredCredentialValue(credential.name);
      return !storedValue?.trim();
    }) || []
  );
});

const credentialsWithValue = computed(() => {
  return (
    props.credentials?.filter((credential) => {
      const storedValue = getStoredCredentialValue(credential.name);
      return Boolean(storedValue?.trim());
    }) || []
  );
});

const formattedUsedCredentials = computed(() => {
  return formatListToReadable(
    credentialsWithValue.value.map((credential) => credential.label),
  );
});

function getCredentialValue(credentialName: string) {
  return credentialValues.value?.[credentialName] ?? '';
}

function getStoredCredentialValue(credentialName: string) {
  const [index, type] = tuningsStore.getCredentialIndex(credentialName);

  if (index === -1) return '';

  return tuningsStore.initialCredentials?.[type]?.[index]?.value || '';
}

function handleInputChange(credential: AgentCredential, value: string) {
  credentialValues.value = {
    ...credentialValues.value,
    [credential.name]: value,
  };
}
</script>

<style scoped lang="scss">
.modal-assign-agent__credentials {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
}

.modal-assign-agent__credentials-field {
  width: 100%;
}

.modal-assign-agent__credentials-not-required {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-body;
}
</style>
