<template>
  <AgentDetailSection
    :title="$t('agents.assigned_agents.agent_details.system')"
  >
    <section class="agent-detail-modal__system-items">
      <SystemBadge
        :system="system"
        class="agent-detail-modal__system-skill"
      />
    </section>
  </AgentDetailSection>
</template>

<script setup lang="ts">
import SystemBadge from '@/components/AgentsTeam/SystemBadge.vue';
import AgentDetailSection from './AgentDetailSection.vue';

defineProps<{
  system: string;
}>();
</script>

<style lang="scss" scoped>
.agent-detail-modal__system-items {
  display: flex;
  gap: $unnnic-space-2;
}
</style>
