<template>
  <section
    :class="[
      'improvements-list',
      { 'improvements-list--selected': selectedImprovement },
    ]"
    data-testid="improvements-list"
  >
    <UnnnicTable version="2">
      <UnnnicTableHeader class="improvements-list__header">
        <UnnnicTableRow>
          <UnnnicTableHead
            v-for="column in columns"
            :key="`improvement-table-head-${column}`"
            :class="`improvements-list__col improvements-list__col--${column}`"
            :data-testid="`improvement-table-head-${column}`"
          >
            {{ $t(`audit.improvements.columns.${column}`) }}
          </UnnnicTableHead>
        </UnnnicTableRow>
      </UnnnicTableHeader>

      <UnnnicTableBody class="improvements-list__rows">
        <ImprovementRow
          v-for="improvement in improvementResults"
          :key="improvement.uuid"
          data-testid="improvement-row"
          :improvement="improvement"
          :isSelected="improvement.uuid === selectedImprovement?.uuid"
          @click="handleRowClick(improvement)"
        />
      </UnnnicTableBody>
    </UnnnicTable>

    <ImprovementDrawer
      v-model:open="isDrawerOpen"
      :improvement="selectedImprovement"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import ImprovementDrawer from '@/components/ConversationsImprovements/ImprovementDrawer.vue';
import ImprovementRow from '@/components/ConversationsImprovements/ImprovementRow.vue';

import type { Improvement } from '@/store/types/Improvements.types';

const improvementsStore = useImprovementsStore();
const { improvements } = storeToRefs(improvementsStore);

const selectedImprovement = ref<Improvement | null>(null);
const isDrawerOpen = ref(false);

const improvementResults = computed(() => improvements.value.data);

const columns = ['improvement', 'type', 'affected_conversations'] as const;

function handleRowClick(improvement: Improvement) {
  selectedImprovement.value = improvement;
  isDrawerOpen.value = true;
}

watch(isDrawerOpen, (open) => {
  if (!open) {
    selectedImprovement.value = null;
  }
});
</script>

<style scoped lang="scss">
.improvements-list {
  margin-right: 0;
  margin-bottom: $unnnic-spacing-sm;

  height: 100%;

  overflow: hidden;

  display: flex;
  flex-direction: column;

  :deep(.improvements-list__col--improvement) {
    width: calc(100% / 12 * 8);
  }

  :deep(.improvements-list__col--type),
  :deep(.improvements-list__col--affected_conversations) {
    width: calc(100% / 12 * 2);
  }
}
</style>
