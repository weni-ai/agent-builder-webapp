<template>
  <section
    class="manager-upgrade-card"
    data-testid="manager-upgrade-card"
  >
    <p class="manager-upgrade-card__title">
      {{ title }}
    </p>

    <p class="manager-upgrade-card__description">
      {{ description }}
    </p>

    <ul class="manager-upgrade-card__highlights">
      <li
        v-for="(highlight, index) in highlights"
        :key="`${highlight}-${index}`"
        class="manager-upgrade-card__highlight"
      >
        <UnnnicIcon
          icon="check"
          size="ant"
          scheme="teal-600"
          class="manager-upgrade-card__highlight-icon"
        />

        <p class="manager-upgrade-card__highlight-text">
          {{ highlight }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useManagerSelectorStore } from '@/store/ManagerSelector';

const { t, tm } = useI18n();
const managerSelectorStore = useManagerSelectorStore();

const title = computed(() =>
  t('agent_builder.tunings.manager.upgrade_banner.title', {
    manager_name: managerSelectorStore.options.managers.new.label,
  }),
);
const description = computed(() =>
  t('agent_builder.tunings.manager.upgrade_banner.manager_2_dot_6_description'),
);
const highlights = computed(() =>
  tm('agent_builder.tunings.manager.upgrade_banner.manager_2_dot_6_highlights'),
);
</script>

<style lang="scss" scoped>
.manager-upgrade-card {
  background-color: $unnnic-color-teal-50;
  border: 1px solid $unnnic-color-teal-300;
  border-radius: $unnnic-radius-4;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  padding: $unnnic-space-4;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;
    font-weight: $unnnic-font-weight-bold;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__highlights {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__highlight {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-2;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__highlight-icon {
    margin-top: $unnnic-space-05;
  }
}
</style>
