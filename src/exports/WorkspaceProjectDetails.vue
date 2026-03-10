<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import FederatedWrapper from '@/components/FederatedWrapper.vue';
import ProjectDetailsModal from '@/components/Tunings/ProjectDetailsModal/index.vue';
</script>

<template>
  <FederatedWrapper>
    <ProjectDetailsModal v-bind="$attrs as any" />
  </FederatedWrapper>
</template>
