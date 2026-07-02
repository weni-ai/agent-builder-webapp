<template>
  <p
    v-if="instructionsStore.isSearching"
    class="instructions-results-count"
    data-testid="instructions-results-count"
  >
    {{ resultsCountText }}
  </p>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const resultsCountText = computed(() =>
  t('agents.instructions.view.results_count', {
    count: instructionsStore.flatInstructions.length,
  }),
);
</script>

<style lang="scss" scoped>
.instructions-results-count {
  color: $unnnic-color-fg-muted;
  font: $unnnic-font-body;
}
</style>
