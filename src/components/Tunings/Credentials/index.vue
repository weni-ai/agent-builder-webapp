<template>
  <section class="credentials">
    <section class="credentials__form">
      <p
        class="credentials__description"
        data-testid="credentials-description"
      >
        {{ $t('router.tunings.credentials.used_by_official_agents') }}
      </p>
      <CredentialsForm
        data-testid="credentials-form"
        :credentials="credentials?.officialAgents"
      />
    </section>

    <UnnnicDivider data-testid="credentials-divider" />

    <section class="credentials__form">
      <p
        class="credentials__description"
        data-testid="credentials-description"
      >
        {{ $t('router.tunings.credentials.used_by_customized_agents') }}
      </p>
      <CredentialsForm
        data-testid="credentials-form"
        :credentials="credentials?.myAgents"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

import CredentialsForm from './CredentialsForm.vue';
import UnnnicDivider from '@/components/Divider.vue';

const props = defineProps({
  saveTrigger: { type: Number, default: 0 },
});

const emit = defineEmits(['update:isSaveAvailable', 'saved']);

const tuningsStore = useTuningsStore();

const credentials = computed(() => tuningsStore.credentials.data);
const isSaveAvailable = computed(() => tuningsStore.isCredentialsValid);

onMounted(() => {
  if (!credentials.value && tuningsStore.credentials.status !== 'loading') {
    tuningsStore.fetchCredentials();
  }
});

watch(
  isSaveAvailable,
  (value) => {
    emit('update:isSaveAvailable', value);
  },
  { immediate: true },
);

watch(
  () => props.saveTrigger,
  async () => {
    if (!isSaveAvailable.value) return;

    await tuningsStore.saveCredentials();

    emit('saved', {
      success: tuningsStore.credentials.status !== 'error',
    });
  },
);
</script>

<style lang="scss" scoped>
.credentials {
  &__form {
    display: grid;
    gap: $unnnic-spacing-sm;
  }

  &__description {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }
}
</style>
