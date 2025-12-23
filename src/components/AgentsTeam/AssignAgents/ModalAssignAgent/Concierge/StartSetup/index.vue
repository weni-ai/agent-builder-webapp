<template>
  <section class="modal-assign-agent__start-setup">
    <section class="modal-assign-agent__start-setup-about">
      <About :agent="agent" />
    </section>

    <section class="modal-assign-agent__start-setup-mcps">
      <MCPs :mcps="mockedMCPS" />
    </section>

    <section class="modal-assign-agent__start-setup-conversation">
      <p>Conversation</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { AgentGroup, AgentMCP } from '@/store/types/Agents.types';

import About from './About.vue';
import MCPs from './MCPs.vue';

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
