<template>
  <section class="audio-player-bar">
    <audio
      ref="audioRef"
      :src="audio"
      preload="metadata"
      style="display: none"
    />

    <UnnnicIcon
      class="audio-player-bar__play-button"
      :icon="isPlaying ? 'pause' : 'play_arrow'"
      filled
      scheme="gray-500"
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
        :disabled="hasError || isLoading"
        :style="{
          '--progress':
            duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
        }"
        @input="handleProgressChange"
      />
      <span
        v-for="i in 75"
        :key="i"
        class="audio-player-bar__bar"
      />
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

/**
 * AudioPlayerBar - Audio message component
 *
 * Simple audio player with:
 * - Play/pause button
 * - Range input for progress
 * - Time display
 */

defineProps({
  audio: {
    type: String,
    required: true,
  },
});

const audioRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isLoading = ref(true);
const hasError = ref(false);

const togglePlayPause = async () => {
  if (!audioRef.value || hasError.value) return;

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
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: transparent;

  &__play-button {
    flex-shrink: 0;
  }

  &__progress-bar {
    position: absolute;

    flex: 1;
    height: $unnnic-icon-size-5;
    background: transparent;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      // background: transparent;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 12px;
      // background: transparent;
      cursor: pointer;
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
    width: 1px;
    height: 100%;
    background: $unnnic-color-gray-200;
    border-radius: $unnnic-radius-2;
  }
}
</style>
