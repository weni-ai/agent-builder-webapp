<template>
  <section class="credentials">
    <section class="credentials__form">
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-lg"
        color="neutral-darkest"
        weight="bold"
        data-testid="credentials-description"
      >
        {{ $t('router.tunings.credentials.used_by_official_agents') }}
      </UnnnicIntelligenceText>
      <CredentialsForm
        data-testid="credentials-form"
        :credentials="credentials?.officialAgents"
      />
    </section>

    <UnnnicDivider data-testid="credentials-divider" />

    <section class="credentials__form">
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-lg"
        color="neutral-darkest"
        weight="bold"
        data-testid="credentials-description"
      >
        {{ $t('router.tunings.credentials.used_by_customized_agents') }}
      </UnnnicIntelligenceText>
      <CredentialsForm
        data-testid="credentials-form"
        :credentials="credentials?.myAgents"
      />
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

import CredentialsForm from './CredentialsForm.vue';

const tuningsStore = useTuningsStore();

const credentials = computed(() => tuningsStore.credentials.data);
</script>

<style lang="scss" scoped>
.credentials {
  &__form {
    display: grid;
    gap: $unnnic-spacing-sm;
  }
}
</style>
