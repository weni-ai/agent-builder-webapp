<template>
  <section
    data-testid="agent-card"
    :class="[
      'agent-card',
      { 'agent-card--with-footer': $slots.footer && !loading },
      { 'agent-card--new-agent': newAgentHighlight && !loading },
    ]"
  >
    <AssignAgentCardSkeleton
      v-if="loading"
      data-testid="agent-card-skeleton"
    />

    <template v-else>
      <section class="agent-card__content">
        <AgentIcon
          v-if="agent.icon"
          :icon="agent.icon"
          class="agent-card__icon"
          data-testid="agent-icon"
        />

        <header class="agent-card__header">
          <UnnnicIntelligenceText
            tag="p"
            family="secondary"
            size="body-gt"
            color="neutral-darkest"
            weight="bold"
            data-testid="title"
          >
            {{ agent.name }}
          </UnnnicIntelligenceText>

          <section
            v-if="$slots.actions"
            class="agent-card__actions"
            data-testid="agent-card-actions"
          >
            <slot name="actions" />
          </section>

          <UnnnicTag
            v-if="isAgentInTeam"
            class="agent-card__tag"
            size="small"
            :text="
              agent.is_official
                ? $t('router.agents_team.card.official')
                : $t('router.agents_team.card.custom')
            "
            :scheme="agent.is_official ? 'weni' : 'aux-purple'"
            data-testid="agent-tag"
          />
        </header>

        <section class="agent-card__infos">
          <p
            v-if="agent.description"
            class="agent-card__description"
            :title="agent.description"
            data-testid="description"
          >
            {{ agent.description }}
          </p>

          <section class="agent-card__skills">
            <Skill
              v-for="(tag, index) in tags"
              :key="`${index}-${tag.name}`"
              :title="tag.name"
              :icon="tag.icon"
              data-testid="skill"
            />
          </section>
        </section>
      </section>

      <slot
        v-if="$slots.footer"
        name="footer"
      />

      <p
        v-if="newAgentHighlight"
        class="agent-card__new-agent-tag"
      >
        {{ $t('agents.assigned_agents.new_agent') }}
      </p>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AssignAgentCardSkeleton from './AssignAgentCardSkeleton.vue';
import Skill from './Skill.vue';
import AgentIcon from './AgentIcon.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  agent: {
    type: Object,
    default: () => ({}),
  },
  tags: {
    type: Array,
    default: () => [],
  },
  newAgentHighlight: {
    type: Boolean,
    default: false,
  },
});

const agentsTeamStore = useAgentsTeamStore();

const isAgentInTeam = computed(() => {
  return agentsTeamStore.activeTeam.data.agents.some(
    (agent) => agent.uuid === props.agent.uuid,
  );
});
</script>

<style lang="scss" scoped>
.agent-card {
  border-radius: $unnnic-radius-4;
  border: $unnnic-border-width-thinner solid $unnnic-color-border-base;

  padding: $unnnic-spacing-sm;

  display: grid;
  gap: $unnnic-space-4;

  &--with-footer {
    grid-template-rows: 1fr auto;
  }

  &--new-agent {
    position: relative;

    border: 2px solid transparent;
    background:
      linear-gradient(
          $unnnic-color-background-snow,
          $unnnic-color-background-snow
        )
        padding-box,
      linear-gradient(135deg, $unnnic-color-teal-400, $unnnic-color-teal-600)
        border-box;
    background-clip: padding-box, border-box;
  }

  &__content {
    display: grid;
    grid-template-columns: auto repeat(3, 1fr);
    grid-template-rows: auto 1fr;
    column-gap: $unnnic-space-2;
    row-gap: $unnnic-space-4;

    .agent-card__icon {
      width: $unnnic-icon-size-xl;
      height: auto;
      aspect-ratio: 1/1;

      grid-column: 1 / 2;
      grid-row: 1 / 2;
      align-self: center;
    }

    .agent-card__header {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: $unnnic-spacing-xs;
      row-gap: $unnnic-space-05;
      align-content: center;

      grid-column: 2 / 5;
      grid-row: 1 / 2;

      .agent-card__tag {
        grid-row: 2 / 3;
      }

      .agent-card__actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        grid-column: 2 / 3;
        grid-row: 1 / 2;
      }
    }

    .agent-card__infos {
      display: flex;
      flex-direction: column;
      gap: $unnnic-space-2;

      grid-column: 1 / 5;

      .agent-card__description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        color: $unnnic-color-fg-base;
        font: $unnnic-font-body;
      }

      .agent-card__skills {
        display: flex;
        gap: $unnnic-space-2;
        flex-wrap: wrap;
      }
    }
  }

  &__new-agent-tag {
    $fontLineHeight: 18px;

    position: absolute;
    left: $unnnic-space-4;
    top: calc((($fontLineHeight / 2) + $unnnic-space-05) * -1);

    border-radius: $unnnic-radius-1;

    padding: $unnnic-space-05 $unnnic-space-2;

    background-color: $unnnic-color-teal-300;
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-caption-1;
  }
}
</style>
