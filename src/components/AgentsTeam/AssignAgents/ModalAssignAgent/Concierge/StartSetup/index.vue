<template>
  <section class="modal-assign-agent__start-setup">
    <section class="modal-assign-agent__start-setup-about">
      <About :agent="agent" />
    </section>

    <section class="modal-assign-agent__start-setup-mcps">
      <p>MCPS</p>
    </section>

    <section class="modal-assign-agent__start-setup-conversation">
      <p>Conversation</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { AgentGroup } from '@/store/types/Agents.types';

import About from './About.vue';

defineProps<{
  agent: AgentGroup;
}>();
</script>

<style lang="scss" scoped>
.modal-assign-agent__start-setup {
  padding: $unnnic-space-6;

  display: grid;
  grid-template-columns: 4fr 3fr;
  gap: $unnnic-space-4;

  &-about {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  &-mcps {
    grid-row: 2 / 3;
    grid-column: 1 / 2;
  }

  &-conversation {
    grid-row: 1 / 3;
    grid-column: 2 / 3;
  }
}
</style>
