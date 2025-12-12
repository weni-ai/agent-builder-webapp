<template>
  <header class="conversation__header">
    <section class="header__top">
      <SupervisorUsername
        :username="conversation?.username"
        font="display-2"
      />

      <UnnnicButton
        class="header__close-button"
        type="tertiary"
        size="small"
        iconCenter="close"
        data-testid="close-button"
        @click="supervisorStore.selectConversation(null)"
      />
    </section>

    <Details />
  </header>
</template>

<script setup>
import { computed } from 'vue';

import { useSupervisorStore } from '@/store/Supervisor';

import SupervisorUsername from '@/components/Supervisor/SupervisorUsername.vue';
import Details from './Details/index.vue';

const supervisorStore = useSupervisorStore();
const conversation = computed(() => supervisorStore.selectedConversation);
</script>

<style lang="scss" scoped>
.conversation {
  &__header {
    padding: $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    .header__top {
      overflow: hidden;

      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: $unnnic-space-2;
    }
  }
}
</style>
