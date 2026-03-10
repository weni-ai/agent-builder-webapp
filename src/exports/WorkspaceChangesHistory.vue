<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import FederatedWrapper from '@/components/FederatedWrapper.vue';
import ChangesHistory from '@/components/Tunings/ChangesHistory.vue';
</script>

<template>
  <FederatedWrapper>
    <ChangesHistory />
  </FederatedWrapper>
</template>
