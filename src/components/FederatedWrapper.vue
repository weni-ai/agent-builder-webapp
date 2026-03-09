<template>
  <div class="agent-builder-federated">
    <slot />
  </div>
</template>

<script setup>
import { ensurePinia } from '@/utils/ensurePinia';

ensurePinia();
</script>

<style lang="scss">
.agent-builder-federated {
  @import '../styles/global.scss';
}
</style>
