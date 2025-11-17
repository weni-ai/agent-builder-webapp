<template>
  <section
    :class="['audio-player-bar', { 'audio-player-bar--disabled': disabled }]"
  >
    <audio
      ref="audioRef"
      :src="audio"
      preload="metadata"
      style="display: none"
      aria-hidden
    />

    <UnnnicIcon
      class="audio-player-bar__play-button"
      :icon="isPlaying ? 'pause' : 'play_arrow'"
      filled
      :scheme="disabled ? 'bg-muted' : 'gray-500'"
      size="lg"
      clickable
      :aria-label="isPlaying ? 'Pause audio' : 'Play audio'"
      @click="togglePlayPause"
    />

    <section class="audio-player-bar__bars">
      <input
        class="audio-player-bar__progress-bar"
        type="range"
        min="0"
        :max="duration || 0"
        step="0.001"
        :value="currentTime"
        :disabled="hasError || isLoading || disabled"
        :style="{
          '--progress': duration > 0 ? `${progressPercentage}%` : '0%',
        }"
        @input="handleProgressChange"
      />
      <span
        v-for="i in 75"
        :key="i"
        :class="[
          'audio-player-bar__bar',
          {
            'audio-player-bar__bar--active': isBarActive(i),
            'audio-player-bar__bar--disabled': disabled,
          },
        ]"
        aria-hidden
      />
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  audio: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const audioRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isLoading = ref(true);
const hasError = ref(false);

const progressPercentage = computed(() => {
  return (currentTime.value / duration.value) * 100;
});

const togglePlayPause = async () => {
  if (!audioRef.value || hasError.value || props.disabled) return;

  try {
    if (isPlaying.value) {
      audioRef.value.pause();
    } else {
      await audioRef.value.play();
    }
  } catch (error) {
    console.error('Error toggling audio playback:', error);
    hasError.value = true;
  }
};

const handleProgressChange = (event) => {
  if (!audioRef.value) return;
  const newTime = parseFloat(event.target.value);
  audioRef.value.currentTime = newTime;
  currentTime.value = newTime;
};

const isBarActive = (index) => {
  return (progressPercentage.value / 100) * 75 >= index;
};

onMounted(() => {
  const audio = audioRef.value;
  if (!audio) return;

  const handleLoadedMetadata = () => {
    duration.value = audio.duration;
    isLoading.value = false;
    hasError.value = false;
  };

  const handleTimeUpdate = () => {
    currentTime.value = audio.currentTime;
  };

  const handlePlay = () => {
    isPlaying.value = true;
  };

  const handlePause = () => {
    isPlaying.value = false;
  };

  const handleEnded = () => {
    isPlaying.value = false;
    currentTime.value = 0;
  };

  const handleError = () => {
    hasError.value = true;
    isLoading.value = false;
    isPlaying.value = false;
  };

  const handleLoadStart = () => {
    isLoading.value = true;
    hasError.value = false;
  };

  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('play', handlePlay);
  audio.addEventListener('pause', handlePause);
  audio.addEventListener('ended', handleEnded);
  audio.addEventListener('error', handleError);
  audio.addEventListener('loadstart', handleLoadStart);

  onUnmounted(() => {
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('pause', handlePause);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('loadstart', handleLoadStart);
  });
});
</script>

<style lang="scss" scoped>
.audio-player-bar {
  display: flex;
  align-items: center;

  cursor: pointer;

  &--disabled {
    cursor: not-allowed;

    .audio-player-bar__play-button {
      cursor: not-allowed;
    }
  }

  &__progress-bar {
    position: absolute;

    flex: 1;

    width: 100%;
    height: $unnnic-icon-size-5;

    outline: none;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;

    cursor: pointer;

    &::-webkit-slider-thumb {
      width: $unnnic-space-3;
      height: $unnnic-space-3;

      -webkit-appearance: none;
      appearance: none;
    }

    &::-moz-range-thumb {
      width: $unnnic-space-3;
      height: $unnnic-space-3;
      border: none;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__bars {
    position: relative;

    display: flex;
    align-items: center;
    gap: $unnnic-space-05;

    width: 100%;
    height: 30px;
  }

  &__bar {
    width: 2px;
    height: 100%;
    background-color: $unnnic-color-gray-200;
    border-radius: $unnnic-radius-2;

    &--disabled {
      background-color: $unnnic-color-bg-muted;
    }

    &--active {
      background-color: $unnnic-color-gray-500;
    }

    $heights: (80%, 50%, 50%);

    @for $i from 3 to 75 {
      &:nth-of-type(#{$i}) {
        $index: ($i - 3) % length($heights) + 1;
        height: nth($heights, $index);
      }
    }

    &:first-of-type,
    &:last-of-type {
      height: 20%;
    }

    &:nth-of-type(2),
    &:nth-of-type(74) {
      height: 50%;
    }
  }
}
</style>
