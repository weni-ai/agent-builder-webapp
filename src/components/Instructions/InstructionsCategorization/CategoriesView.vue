<template>
  <section
    class="categories-view"
    data-testid="categories-view"
  >
    <CategoryAccordion
      v-for="(group, index) in groups"
      :key="group.key"
      :ref="(el) => setGroupRef(group.key, el)"
      :group="group"
      :initiallyExpanded="index === 0"
      :forceExpanded="instructionsStore.isSearching"
      :data-testid="`categories-view-group-${group.key}`"
      @delete-category="$emit('delete-category', $event)"
      @rename-category="$emit('rename-category', $event)"
      @edit="$emit('edit', $event)"
    />

    <SafetyGuardrails v-if="featureFlags.customGuardrails" />
  </section>
</template>

<script setup>
import { computed, nextTick, watch } from 'vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { useInstructionsStore } from '@/store/Instructions';

import CategoryAccordion from './CategoryAccordion.vue';
import SafetyGuardrails from './SafetyGuardrails.vue';

const props = defineProps({
  scrollToGroupKey: {
    type: String,
    default: null,
  },
});

defineEmits(['delete-category', 'edit', 'rename-category']);

const featureFlagsStore = useFeatureFlagsStore();
const instructionsStore = useInstructionsStore();

const featureFlags = computed(() => featureFlagsStore.flags);
const groups = computed(() => instructionsStore.groupedInstructions);

const groupRefs = {};

function setGroupRef(key, el) {
  if (el) {
    groupRefs[key] = el;
  } else {
    delete groupRefs[key];
  }
}

watch(
  () => props.scrollToGroupKey,
  (key) => {
    if (!key) return;

    nextTick(() => {
      groupRefs[key]?.$el?.scrollIntoView?.({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  },
);
</script>

<style lang="scss" scoped>
.categories-view {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
}
</style>
