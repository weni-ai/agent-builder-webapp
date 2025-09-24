<template>
  <section class="human-support">
    <header class="human-support__header">
      <UnnnicIntelligenceText
        data-testid="title"
        tag="p"
        family="secondary"
        color="neutral-darkest"
        weight="bold"
        size="body-lg"
      >
        {{ $t('profile.human_support.title') }}
      </UnnnicIntelligenceText>
    </header>

    <section class="human-support__form">
      <LoadingFormElement
        v-if="loading"
        label
        element="textarea"
        data-testid="form-loading"
      />

      <template v-else>
        <SettingsField
          v-model="tunings.settings.data.humanSupport"
          data-testid="field"
          :textRight="$t('profile.human_support.title')"
          :description="$t('router.tunings.settings.human_support.description')"
        />
        <UnnnicFormElement
          data-testid="form-element"
          class="form__element"
          :label="$t('profile.human_support.fields.rules.title')"
          :error="error ? $t('profile.invalid_field') : ''"
          :disabled="!humanSupport"
        >
          <UnnnicTextArea
            v-model="tunings.settings.data.humanSupportPrompt"
            data-testid="textarea"
            :placeholder="$t('profile.human_support.fields.rules.placeholder')"
            :type="error ? 'error' : 'normal'"
            :disabled="!humanSupport"
          />
        </UnnnicFormElement>
      </template>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

import LoadingFormElement from '@/components/LoadingFormElement.vue';
import SettingsField from './SettingsField.vue';

const tunings = useTuningsStore();

const loading = computed(() => !tunings.settings.status);
const humanSupport = computed(() => tunings.settings.data.humanSupport);
const error = computed(
  () => !tunings.settings.data.humanSupportPrompt && humanSupport.value,
);
</script>

<style lang="scss" scoped>
.human-support {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  .human-support__header {
    display: flex;
    gap: $unnnic-spacing-xs;
  }

  .human-support__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-ant;
  }
}
</style>
