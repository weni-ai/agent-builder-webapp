<template>
  <section
    class="modal-assign-agent__start-setup"
    data-testid="start-setup"
  >
    <About
      :agent="agent"
      data-testid="start-setup-about-section"
    />

    <MCPs
      :mcps="agent.MCPs || []"
      data-testid="start-setup-mcps-section"
    />

    <ConversationExample data-testid="start-setup-conversation-section" />
  </section>
</template>

<script setup lang="ts">
import type { AgentGroup } from '@/store/types/Agents.types';

import About from './About.vue';
import MCPs from './MCPs.vue';
import ConversationExample from './ConversationExample.vue';

defineProps<{
  agent: AgentGroup;
}>();
</script>

<style lang="scss" scoped>
.modal-assign-agent__start-setup {
  overflow: auto;

  padding: $unnnic-space-6;

  display: grid;
  grid-template-columns: 4fr 3fr;
  gap: $unnnic-space-4;
}
</style>
