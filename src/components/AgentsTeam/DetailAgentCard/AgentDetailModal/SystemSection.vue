<template>
  <AgentDetailSection
    :title="$t('agents.assigned_agents.agent_details.system')"
  >
    <section class="agent-detail-modal__system-items">
      <Skill
        :title="system.name"
        :icon="system?.icon"
        class="agent-detail-modal__system-skill"
      />
    </section>
  </AgentDetailSection>
</template>

<script setup lang="ts">
import Skill from '@/components/AgentsTeam/Skill.vue';
import AgentDetailSection from './AgentDetailSection.vue';
import type { AgentAssignedSystem } from '@/store/types/Agents.types';

defineProps<{
  system: AgentAssignedSystem;
}>();
</script>

<style lang="scss" scoped>
.agent-detail-modal__system-items {
  display: flex;
  gap: $unnnic-space-2;
}
</style>
