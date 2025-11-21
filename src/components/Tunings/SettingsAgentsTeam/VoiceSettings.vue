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

          <section class="voice-settings__reproduction">
            <UnnnicSelectSmart
              v-model:modelValue="selectedVoice"
              class="voice-settings__select"
              :options="voiceOptions"
              :disabled="!useVoice"
            />
            <AudioPlayerBar
              :audio="selectedVoice[0]?.audio"
              :disabled="!useVoice"
            />
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
import { computed, ref, watch } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

import LoadingFormElement from '@/components/LoadingFormElement.vue';
import SettingsField from './SettingsField.vue';
import AudioPlayerBar from '@/components/AudioPlayerBar.vue';

import shimmerAudio from '@/assets/audio/agent_voice/shimmer.wav';
import alloyAudio from '@/assets/audio/agent_voice/alloy.wav';
import ashAudio from '@/assets/audio/agent_voice/ash.wav';
import balladAudio from '@/assets/audio/agent_voice/ballad.wav';
import coralAudio from '@/assets/audio/agent_voice/coral.wav';
import echoAudio from '@/assets/audio/agent_voice/echo.wav';
import fableAudio from '@/assets/audio/agent_voice/fable.wav';
import onyxAudio from '@/assets/audio/agent_voice/onyx.wav';
import novaAudio from '@/assets/audio/agent_voice/nova.wav';
import sageAudio from '@/assets/audio/agent_voice/sage.wav';
import verseAudio from '@/assets/audio/agent_voice/verse.wav';

const tunings = useTuningsStore();

const loading = computed(() => !tunings.settings.status);
const useVoice = computed(() => tunings.settings.data.useVoice);

const AUDIO_FILES = {
  shimmer: shimmerAudio,
  alloy: alloyAudio,
  ash: ashAudio,
  ballad: balladAudio,
  coral: coralAudio,
  echo: echoAudio,
  fable: fableAudio,
  onyx: onyxAudio,
  nova: novaAudio,
  sage: sageAudio,
  verse: verseAudio,
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const createVoiceOption = (voiceName) => ({
  value: voiceName,
  label: capitalize(voiceName),
  audio: AUDIO_FILES[voiceName],
});

const voiceOptions = Object.keys(AUDIO_FILES).map(createVoiceOption);
const selectedVoice = ref([
  createVoiceOption(tunings.settings.data.selectedVoice),
]);

watch(selectedVoice, (newSelectedVoice) => {
  tunings.settings.data.selectedVoice = newSelectedVoice[0].value;
});
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

    &-description {
      font: $unnnic-font-caption-2;
      color: $unnnic-color-fg-base;
    }
  }

  &__reproduction {
    padding: $unnnic-space-3 $unnnic-space-4;
    border-radius: $unnnic-radius-4;
    border: 1px solid $unnnic-color-border-soft;

    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    width: fit-content;
  }

  &__select {
    max-width: 250px;
  }
}
</style>
