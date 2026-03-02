<template>
  <form
    class="tone-of-voice-radios"
    data-testid="tone-of-voice-radios"
    @submit.prevent
  >
    <template
      v-for="tone in tones"
      :key="tone.id"
    >
      <UnnnicToolTip
        side="top"
        maxWidth="200px"
        enabled
        :text="tone.tooltip"
        class="tone-of-voice-radios__radio"
      >
        <button
          :data-testid="`tone-of-voice-radio-${tone.id}`"
          :class="[
            'tone-of-voice-radios__radio-inner',
            {
              'tone-of-voice-radios__radio-inner--selected':
                tone.id === selectedTone,
            },
          ]"
          @keydown.enter.space.prevent="handleToneChange(tone.id)"
        >
          <input
            :id="`tone-of-voice-${tone.id}`"
            class="tone-of-voice-radios__radio-input"
            type="radio"
            name="tone-of-voice"
            :value="tone.id"
            :checked="tone.id === selectedTone"
            @change="handleToneChange(tone.id)"
          />
          <label :for="`tone-of-voice-${tone.id}`"> {{ tone.emoji }} </label>
          <label :for="`tone-of-voice-${tone.id}`"> {{ tone.name }} </label>
        </button>
      </UnnnicToolTip>
    </template>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

type ToneTranslation = { name: string; tooltip: string };

defineProps<{
  selectedTone: string;
}>();

const emit = defineEmits<{
  (_e: 'update:selected-tone', _tone: string): void;
}>();

const handleToneChange = (tone: string) => {
  emit('update:selected-tone', tone);
};

const tones = computed(() => {
  const tonesEmojis: Record<string, string> = {
    friendly: '😊',
    systematic: '📋',
    analytical: '🧠',
    creative: '💡',
    casual: '😎',
  };

  type I18nTones = Record<string, ToneTranslation>;
  const tonesKey = 'agents.profile.tone_of_voice.tones';
  const i18nTones = (i18n.global as { tm: (_key: string) => I18nTones }).tm(
    tonesKey,
  ) as I18nTones;

  return Object.keys(i18nTones).map((tone) => ({
    id: tone,
    name: i18nTones[tone].name,
    tooltip: i18nTones[tone].tooltip,
    emoji: tonesEmojis[tone],
  }));
});
</script>

<style lang="scss" scoped>
.tone-of-voice-radios {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-space-2;

  &__radio-input {
    display: none;
  }

  &__radio-inner {
    padding: $unnnic-space-2 $unnnic-space-4;

    display: flex;
    align-items: center;
    gap: $unnnic-space-1;

    border-radius: $unnnic-radius-2;
    border: 1px solid $unnnic-color-border-base;
    background: $unnnic-color-bg-base;

    transition-property: background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.15s;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;

    cursor: pointer;

    &--selected {
      border-color: $unnnic-color-border-active;
      background: $unnnic-color-teal-50;
    }
  }
}
</style>
