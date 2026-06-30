<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    data-testid="improvement-drawer"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="improvement-drawer-title">
          {{ improvement?.text }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section
        class="improvement-drawer"
        data-testid="improvement-drawer-content"
      >
        <!-- TODO: Implement improvement detail drawer in next branch -->
      </section>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup lang="ts">
import type { Improvement } from '@/store/types/Improvements.types';

const drawerOpen = defineModel<boolean>('open', {
  required: true,
});

defineProps<{
  improvement: Improvement | null;
}>();
</script>

<style scoped lang="scss"></style>
