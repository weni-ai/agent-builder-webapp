<template>
  <section class="voice-settings">
    <h2 class="voice-settings__title">
      {{ $t('agent_builder.tunings.voice_settings.title') }}
    </h2>

    <section class="voice-settings__form">
      <LoadingFormElement
        v-if="loading"
        label
        element="textarea"
        data-testid="form-loading"
      />

      <template v-else>
        <SettingsField
          v-model="tunings.settings.data.useVoice"
          data-testid="field"
          :textRight="$t('agent_builder.tunings.voice_settings.switch.text')"
          :description="
            $t('agent_builder.tunings.voice_settings.switch.description')
          "
        />

        <section class="voice-settings__change-voice">
          <p class="voice-settings__change-voice-title">
            {{ $t('agent_builder.tunings.voice_settings.change_voice.title') }}
          </p>

          <section class="voice-settings__change-voice-select-container">
            <UnnnicSelectSmart
              v-model:modelValue="selectedVoice"
              class="voice-settings__change-voice-select"
              :options="voiceOptions"
            />
            <AudioPlayerBar :audio="selectedVoice[0]?.audio" />
          </section>

          <p class="voice-settings__change-voice-description">
            {{
              $t(
                'agent_builder.tunings.voice_settings.change_voice.description',
              )
            }}
          </p>
        </section>
      </template>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

import LoadingFormElement from '@/components/LoadingFormElement.vue';
import SettingsField from './SettingsField.vue';
import AudioPlayerBar from '@/components/AudioPlayerBar.vue';
import shimmerAudio from '@/assets/audio/agent_voice/shimmer.wav';

const tunings = useTuningsStore();

const loading = computed(() => !tunings.settings.status);
const useVoice = computed(() => tunings.settings.data.useVoice);

const voiceOptions = computed(() => {
  const voices = [
    'Shimmer',
    'Alloy',
    'Ash',
    'Ballad',
    'Coral',
    'Echo',
    'Fable',
    'Onyx',
    'Nova',
    'Sage',
    'Verse',
  ];

  return voices.map((voice) => ({
    value: voice.toLowerCase(),
    label: voice,
    audio: shimmerAudio,
  }));
});
const selectedVoice = ref([
  {
    value: 'shimmer',
    label: 'Shimmer',
    audio: shimmerAudio,
  },
]);
</script>

<style lang="scss" scoped>
.voice-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-neutral-darkest;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }

  &__change-voice {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    &-title {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-base;
    }

    &-select-container {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;
    }

    &-select {
      max-width: 250px;
    }

    &-description {
      font: $unnnic-font-caption-2;
      color: $unnnic-color-fg-base;
    }
  }
}
</style>
