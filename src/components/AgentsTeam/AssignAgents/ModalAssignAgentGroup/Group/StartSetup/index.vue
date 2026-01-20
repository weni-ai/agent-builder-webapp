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
      :mcps="mockedMCPS"
      data-testid="start-setup-mcps-section"
    />

    <ConversationExample data-testid="start-setup-conversation-section" />
  </section>
</template>

<script setup lang="ts">
import type { AgentGroup, AgentMCP } from '@/store/types/Agents.types';

import About from './About.vue';
import MCPs from './MCPs.vue';
import ConversationExample from './ConversationExample.vue';

import { useI18n } from 'vue-i18n';
const { tm } = useI18n();

defineProps<{
  agent: AgentGroup;
}>();

type MCPTranslation = {
  name?: string;
  description?: string;
};

// Instead of mocking, is it possible to bring the MCPs in the endpoint of the agent list?
function buildMockedMCPs(): AgentMCP[] {
  const translatedList = tm(
    'agents.assign_agents.setup.mcps_available.concierge_mcps',
  ) as MCPTranslation[];

  return translatedList.map((mcp) => ({
    name: mcp?.name || '',
    description: mcp?.description || '',
    config: [] as AgentMCP['config'],
  })) as AgentMCP[];
}

const mockedMCPS = buildMockedMCPs();
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
