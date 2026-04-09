<script lang="ts">
export default { inheritAttrs: false };
</script>

<script setup lang="ts">
import FederatedWrapper from '@/components/FederatedWrapper.vue';
import Credentials from '@/components/Tunings/Credentials/index.vue';
</script>

<template>
  <FederatedWrapper>
    <Credentials v-bind="$attrs" />
  </FederatedWrapper>
</template>
