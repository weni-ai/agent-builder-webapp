<template>
  <section
    class="start-setup-mcps"
    data-testid="start-setup-mcps"
  >
    <p
      class="start-setup-mcps__title"
      data-testid="start-setup-mcps-title"
    >
      {{ $t('agents.assign_agents.setup.mcps_available.title') }}
    </p>

    <ul
      v-if="mcps.length"
      class="start-setup-mcps__list"
    >
      <li
        v-for="(mcp, index) in mcps"
        :key="mcp.name"
        :class="[
          'start-setup-mcps__item',
          { 'start-setup-mcps__item--expanded': isExpanded(index) },
        ]"
        data-testid="start-setup-mcps-item"
        @click="toggleItem(index)"
      >
        <UnnnicIcon
          icon="chevron_forward"
          size="sm"
          scheme="fg-emphasized"
          data-testid="start-setup-mcps-item-icon"
          :class="[
            'start-setup-mcps__item-icon',
            { 'start-setup-mcps__item-icon--expanded': isExpanded(index) },
          ]"
        />

        <p
          class="start-setup-mcps__item-title"
          data-testid="start-setup-mcps-item-title"
        >
          {{ mcp.name }}
        </p>

        <section
          data-testid="start-setup-mcps-item-body"
          :class="[
            'start-setup-mcps__item-body',
            { 'start-setup-mcps__item-body--expanded': isExpanded(index) },
          ]"
        >
          <p
            class="start-setup-mcps__item-description"
            data-testid="start-setup-mcps-item-description"
          >
            {{ translateField(mcp.description) }}
          </p>
        </section>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AgentMCP } from '@/store/types/Agents.types';
import useTranslatedField from '@/composables/useTranslatedField';

defineProps<{
  mcps?: AgentMCP[];
}>();

const translateField = useTranslatedField();

const expandedIndex = ref<number>(0);

function isExpanded(index: number): boolean {
  return expandedIndex.value === index;
}

function toggleItem(index: number): void {
  expandedIndex.value = expandedIndex.value === index ? -1 : index;
}
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

    cursor: pointer;

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

    transition: transform 0.2s ease;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__item-title {
    grid-row: 1 / 2;
    grid-column: 2 / 3;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }

  &__item-body {
    grid-row: 2 / 3;
    grid-column: 2 / 3;

    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s ease;

    &--expanded {
      grid-template-rows: 1fr;
    }
  }

  &__item-description {
    overflow: hidden;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}
</style>
