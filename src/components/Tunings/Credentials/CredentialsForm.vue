<template>
  <CredentialsSkeleton
    v-if="!tuningsStore.credentials.data"
    data-testid="credentials-skeleton"
  />

  <UnnnicIntelligenceText
    v-else-if="credentials.length === 0"
    tag="p"
    family="secondary"
    size="body-gt"
    color="neutral-clean"
    data-testid="credentials-description"
  >
    {{ $t('router.tunings.credentials.no_credentials') }}
  </UnnnicIntelligenceText>

  <template v-else>
    <UnnnicFormElement
      v-for="(credential, key) in credentials"
      :key="key"
      :label="credential.label"
      :message="getCredentialDescription(credential)"
      data-testid="credentials-form-element"
    >
      <UnnnicInput
        v-model="credential.value"
        :nativeType="credential.is_confidential ? 'password' : 'text'"
        :placeholder="credential.placeholder || credential.label"
        data-testid="credentials-form-input"
      />
    </UnnnicFormElement>
  </template>
</template>

<script setup>
import { useTuningsStore } from '@/store/Tunings';

import CredentialsSkeleton from './CredentialsSkeleton.vue';
import i18n from '@/utils/plugins/i18n';

import { formatListToReadable } from '@/utils/formatters';

defineProps({
  credentials: {
    type: Array,
    default: () => [],
  },
});

const tuningsStore = useTuningsStore();

function getCredentialDescription(credential) {
  const formattedAgents = formatListToReadable(
    credential.agents_using?.map((agent) => agent.name),
  );

  if (!formattedAgents)
    return i18n.global.t('router.tunings.credentials.no_agents_using');

  return `${i18n.global.t('router.tunings.credentials.used_by')} ${formattedAgents}`;
}
</script>
