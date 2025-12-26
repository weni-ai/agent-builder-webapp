<template>
  <section class="start-setup-mcps">
    <p class="start-setup-mcps__title">
      {{ $t('agents.assign_agents.setup.mcps_available.title') }}
    </p>

    <ul
      v-if="mcps.length"
      class="start-setup-mcps__list"
    >
      <li
        v-for="mcp in mcps"
        :key="mcp.name"
        class="start-setup-mcps__item"
      >
        <UnnnicIcon
          icon="check_circle"
          size="sm"
          scheme="teal-600"
          class="start-setup-mcps__item-icon"
        />

        <p class="start-setup-mcps__item-title">
          {{ mcp.name }}
        </p>

        <p class="start-setup-mcps__item-description">
          {{ mcp.description }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { AgentMCP } from '@/store/types/Agents.types';

defineProps<{
  mcps?: AgentMCP[];
}>();
</script>

<style scoped lang="scss">
.start-setup-mcps {
  grid-row: 2 / 3;
  grid-column: 1 / 2;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__item {
    border: 1px solid $unnnic-color-border-soft;
    padding: $unnnic-space-3 $unnnic-space-4;

    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: $unnnic-space-2;
    align-items: center;

    & + & {
      border-top: none;
    }

    &:first-of-type {
      border-top-left-radius: $unnnic-radius-4;
      border-top-right-radius: $unnnic-radius-4;
    }

    &:last-of-type {
      border-bottom-left-radius: $unnnic-radius-4;
      border-bottom-right-radius: $unnnic-radius-4;
    }
  }

  &__item-icon {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  &__item-title {
    grid-row: 1 / 2;
    grid-column: 2 / 3;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }

  &__item-description {
    grid-row: 2 / 3;
    grid-column: 2 / 3;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}
</style>
