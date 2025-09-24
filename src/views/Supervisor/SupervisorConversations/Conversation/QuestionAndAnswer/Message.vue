<template>
  <section
    :class="[
      'question-and-answer__message',
      `question-and-answer__message--${scheme}`,
    ]"
    data-testid="message"
  >
    <template v-if="treatedMessage.images.length">
      <img
        v-for="(image, index) in treatedMessage.images"
        :key="index"
        :src="image.url"
        :alt="image.alt"
        class="message__image"
        data-testid="image"
      />
    </template>

    <MessageDisplay
      v-if="treatedMessage.text"
      :message="treatedMessage"
      data-testid="message-display"
    >
      <template #components>
        <MessageComponentResolver
          class="message__component"
          :message="parsedJsonMessage?.msg || props.content"
          data-testid="message-component"
        />
      </template>
    </MessageDisplay>

    <UnnnicAudioRecorder
      v-if="treatedMessage.audio"
      class="message__audio"
      :src="treatedMessage.audio.url"
      :canDiscard="false"
      data-testid="audio-recorder"
    />

    <slot />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { attempt, isError } from 'lodash';
import MessageComponentResolver from '@/components/MessageComponents/MessageComponentResolver.vue';
import MessageDisplay from '@/components/QuickTest/MessageDisplay/index.vue';

const MEDIA_PATTERNS = {
  IMAGE: /\['(image\/[^:]+):([^']+)'\]/g,
  AUDIO: /\['(audio\/[^:]+):([^']+)'\]/g,
};

const props = defineProps({
  content: {
    type: Object,
    required: true,
    default: () => ({ text: '', images: [], audio: null }),
  },

  scheme: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'success'].includes(value),
  },
});

const extractImages = (text) => {
  const images = [];
  const cleanedText = text.replace(
    MEDIA_PATTERNS.IMAGE,
    (match, imageType, imageUrl) => {
      images.push({
        url: imageUrl,
        type: imageType,
        alt: `Image (${imageType})`,
      });
      return '';
    },
  );

  return { images, cleanedText };
};

const extractAudio = (text) => {
  let audio = null;
  const cleanedText = text.replace(
    MEDIA_PATTERNS.AUDIO,
    (match, audioType, audioUrl) => {
      if (!audio) {
        audio = {
          url: audioUrl,
          type: audioType,
        };
      }
      return '';
    },
  );

  return { audio, cleanedText };
};

const rawText = computed(() => props.content?.text || '');

const extractedImages = computed(() => {
  if (!rawText.value) return { images: [], cleanedText: '' };
  return extractImages(rawText.value);
});

const extractedAudio = computed(() => {
  if (!extractedImages.value.cleanedText)
    return { audio: null, cleanedText: '' };
  return extractAudio(extractedImages.value.cleanedText);
});

const cleanedText = computed(() => extractedAudio.value.cleanedText.trim());

const parsedJsonMessage = computed(() => {
  if (!cleanedText.value) return null;

  const json = attempt(JSON.parse.bind(null, cleanedText.value));
  return isError(json) ? null : json;
});

const treatedMessage = computed(() => {
  const messageFromJson = parsedJsonMessage.value?.msg || {};

  return {
    text: messageFromJson.text || cleanedText.value,
    images: messageFromJson.images || extractedImages.value.images,
    audio: messageFromJson.audio || extractedAudio.value.audio,
  };
});
</script>

<style lang="scss" scoped>
.question-and-answer__message {
  border-radius: $unnnic-border-radius-md;

  padding: $unnnic-spacing-ant;

  height: fit-content;
  width: fit-content;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  &--neutral {
    background-color: $unnnic-color-background-solo;
    color: $unnnic-color-neutral-dark;
  }

  &--success {
    background-color: $unnnic-color-weni-600;
    color: $unnnic-color-neutral-white;
  }

  .message__image {
    max-width: 100%;
    height: auto;
    max-height: 400px;
    border-radius: $unnnic-border-radius-md;
    object-fit: cover;
  }

  .message__component {
    margin-bottom: $unnnic-spacing-nano;
    cursor: not-allowed;

    &.quick-replies,
    &.list-message,
    &.catalog {
      :deep(button) {
        background-color: $unnnic-color-neutral-soft;
        color: $unnnic-color-neutral-clean;
        cursor: not-allowed;
        pointer-events: none;

        &:hover {
          background-color: $unnnic-color-neutral-soft;
          color: $unnnic-color-neutral-clean;
        }
      }
    }
  }
}
</style>
