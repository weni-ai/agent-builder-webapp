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

    <p
      v-if="lastUpdatedLabel"
      class="start-setup-about__last-updated"
      data-testid="start-setup-about-last-updated"
    >
      {{ lastUpdatedLabel }}
    </p>

    <section
      v-if="agentSystems.length"
      class="start-setup-about__systems"
      data-testid="start-setup-system-badges"
    >
      <SystemBadge
        v-for="slug in agentSystems"
        :key="slug"
        :system="slug"
        class="start-setup-about__skill"
        data-testid="start-setup-about-skill"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import SystemBadge from '@/components/AgentsTeam/SystemBadge.vue';
import useTranslatedField from '@/composables/useTranslatedField';
import { formatLongDate, formatTime } from '@/utils/formatters';
import type { Agent } from '@/store/types/Agents.types';

const GROUP_DOCS: Record<string, string> = {
  ORDER_PAYMENT: '/docs/Payment_Agent.pdf',
  FEEDBACK: '/docs/Feedback_Recorder.pdf',
  ORDER_CANCELLATION: '/docs/Order_Cancellation_Agent.pdf',
  CONCIERGE: '/docs/Product_Concierge.pdf',
  RETURN_AND_EXCHANGE: '/docs/Troca_e_Devolução.pdf',
  ORDER_STATUS: '/docs/Order_Status.pdf',
};

const props = defineProps<{
  agent: Agent;
}>();

const { t } = useI18n();

const translateField = useTranslatedField();

const lastUpdatedLabel = computed(() => {
  const { last_updated, is_official } = props.agent;
  if (!last_updated || is_official) return undefined;

  return t('agents.assign_agents.setup.last_updated', {
    date: formatLongDate(last_updated),
    time: formatTime(last_updated),
  });
});

const documentationUrl = computed(() => {
  const group = props.agent.group;
  if (!group) return null;
  return GROUP_DOCS[group.toUpperCase()] ?? null;
});

const aboutDescription = computed(() => translateField(props.agent.about));

const agentSystems = computed(() => props.agent.systems ?? []);
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

  &__last-updated {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
    margin-top: $unnnic-space-2;
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
