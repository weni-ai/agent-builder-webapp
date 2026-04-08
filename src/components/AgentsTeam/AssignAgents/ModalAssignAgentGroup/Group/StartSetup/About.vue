<template>
  <section
    class="start-setup-about"
    data-testid="start-setup-about"
  >
    <p
      class="start-setup-about__title"
      data-testid="start-setup-about-title"
    >
      {{ $t('agents.assign_agents.setup.about') }}
    </p>

    <section class="start-setup-about__content">
      <p
        class="start-setup-about__description"
        data-testid="start-setup-about-description"
      >
        {{ aboutDescription }}
      </p>

      <a
        v-if="documentationUrl"
        :href="documentationUrl"
        download
        class="start-setup-about__view-documentation"
        data-testid="start-setup-about-view-documentation"
      >
        {{ $t('agents.assign_agents.setup.view_documentation') }}
      </a>
    </section>

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
        data-testid="start-setup-about-skill"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Skill from '@/components/AgentsTeam/Skill.vue';
import useAgentSystems from '@/composables/useAgentSystems';
import useTranslatedField from '@/composables/useTranslatedField';
import type { AgentGroup } from '@/store/types/Agents.types';

const GROUP_DOCS = {
  ORDER_PAYMENT: '/docs/Payment_Agent.pdf',
  FEEDBACK: '/docs/Feedback_Recorder.pdf',
  ORDER_CANCELLATION: '/docs/Order_Cancellation_Agent.pdf',
  CONCIERGE: '/docs/Product_Concierge.pdf',
  RETURN_AND_EXCHANGE: '/docs/Troca_e_Devolução.pdf',
  ORDER_STATUS: '/docs/Order_Status.pdf',
};

const props = defineProps<{
  agent: AgentGroup;
}>();

type SystemBadge = {
  name: string;
  icon: object;
};

const { getSystemsObjects } = useAgentSystems();
const translateField = useTranslatedField();

const documentationUrl = computed(
  () => GROUP_DOCS[props.agent.group.toUpperCase()] ?? null,
);

const aboutDescription = computed(
  () =>
    translateField(props.agent.presentation?.about) ?? props.agent.description,
);

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
  grid-row: 1 / 2;
  grid-column: 1 / 2;

  display: flex;
  flex-direction: column;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;

    margin-bottom: $unnnic-space-2;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__view-documentation {
    color: $unnnic-color-fg-base;
    @include unnnic-font-action;
    text-decoration: underline;

    width: fit-content;

    cursor: pointer;
  }

  &__systems {
    display: flex;
    gap: $unnnic-space-2;
    margin-top: $unnnic-space-4;
  }
}
</style>
