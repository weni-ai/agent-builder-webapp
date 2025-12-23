<template>
  <section class="start-setup-about">
    <p class="start-setup-about__title">
      {{ $t('agents.assign_agents.setup.about') }}
    </p>

    <p class="start-setup-about__description">
      {{ agent.description }}
    </p>

    <section
      v-if="systemBadges.length"
      class="start-setup-about__systems"
      data-testid="start-setup-system-badges"
    >
      <Skill
        v-for="system in systemBadges"
        :key="system.name"
        :title="system.name"
        :icon="system?.icon"
        class="start-setup-about__skill"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Skill from '@/components/AgentsTeam/Skill.vue';
import useAgentSystems from '@/composables/useAgentSystems';
import type { AgentGroup } from '@/store/types/Agents.types';

const props = defineProps<{
  agent: AgentGroup;
}>();

type SystemBadge = {
  name: string;
  icon: object;
};

const { getSystemsObjects } = useAgentSystems();

const systemBadges = computed<SystemBadge[]>(() => {
  const agentSystems = props.agent?.systems ?? [];
  const systems = getSystemsObjects(agentSystems) || [];

  return systems.map((system) => ({
    name: system?.name ?? '',
    icon: system?.icon ?? {},
  }));
});
</script>

<style lang="scss" scoped>
.start-setup-about {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__systems {
    display: flex;
    gap: $unnnic-space-2;
  }
}
</style>
