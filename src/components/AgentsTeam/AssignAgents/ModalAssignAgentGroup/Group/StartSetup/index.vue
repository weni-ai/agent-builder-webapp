<template>
  <section
    :class="[
      'modal-assign-agent__start-setup',
      {
        'modal-assign-agent__start-setup--with-conversation':
          conversationExample.length,
      },
    ]"
    data-testid="start-setup"
  >
    <About
      :agent="agent"
      data-testid="start-setup-about-section"
    />

    <MCPs
      v-if="agentMCPs.length"
      :mcps="agentMCPs"
      data-testid="start-setup-mcps-section"
    />

    <ConversationExample
      v-if="conversationExample.length"
      :conversationExample="conversationExample"
      :agentName="agent.name"
      data-testid="start-setup-conversation-section"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Agent } from '@/store/types/Agents.types';
import useTranslatedField from '@/composables/useTranslatedField';

import About from './About.vue';
import MCPs from './MCPs.vue';
import ConversationExample from './ConversationExample.vue';

const props = defineProps<{
  agent: Agent;
}>();

const translateField = useTranslatedField();

const conversationExample = computed(
  () => translateField(props.agent.conversation_example) ?? [],
);

const agentMCPs = computed(() => props.agent.mcps ?? []);
</script>

<style lang="scss" scoped>
.modal-assign-agent__start-setup {
  overflow: auto;

  padding: $unnnic-space-6;

  display: grid;
  gap: $unnnic-space-4;

  &--with-conversation {
    grid-template-columns: 4fr 3fr;
    grid-template-rows: auto 1fr;
  }
}
</style>
