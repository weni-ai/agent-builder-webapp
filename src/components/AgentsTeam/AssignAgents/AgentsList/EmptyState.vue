<template>
  <section
    class="agents-list-empty"
    data-testid="agents-list-empty-state"
  >
    <UnnnicIcon
      class="agents-list-empty__icon"
      icon="workspaces"
      scheme="neutral-soft"
      size="xl"
      filled
      data-testid="agents-list-empty-state-icon"
    />

    <section class="agents-list-empty__content">
      <h3
        class="agents-list-empty__title"
        data-testid="agents-list-empty-state-title"
      >
        {{ title }}
      </h3>

      <p
        class="agents-list-empty__description"
        data-testid="agents-list-empty-state-description"
      >
        {{ description }}

        <!-- This comment prevents from auto-capitalizing i18n-t to I18nT which would break the component -->
        <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
        <i18n-t
          v-if="variant === 'custom'"
          keypath="router.agents_team.gallery.weni_cli_documentation_description"
          tag="p"
        >
          <template #weni_cli_documentation>
            <p
              class="agents-list-empty__description-link"
              data-testid="weni-cli-documentation-link"
              @click="openCLI"
            >
              {{ $t('router.agents_team.gallery.weni_cli_documentation') }}
            </p>
          </template>
        </i18n-t>
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import i18n from '@/utils/plugins/i18n';

const { t } = i18n.global;

const agentsTeamStore = useAgentsTeamStore();

const variant = computed(() => {
  const { system, search, category } = agentsTeamStore.assignAgentsFilters;

  if (system === 'ALL_CUSTOM' && !search) return 'custom';
  if (category) return 'filters';
  if (search) return 'search';

  return 'filters';
});

const basePath = computed(
  () => `agents.assign_agents.empty_states.${variant.value}`,
);

const title = computed(() => t(`${basePath.value}.title`));
const description = computed(() => t(`${basePath.value}.description`));

function openCLI() {
  window.open(agentsTeamStore.linkToCreateAgent, '_blank');
}
</script>

<style scoped lang="scss">
.agents-list-empty {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-4;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-space-2;
  }

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;

    &-link {
      display: inline;

      color: $unnnic-color-fg-base;
      font: $unnnic-font-body;
      font-weight: $unnnic-font-weight-bold;

      cursor: pointer;

      border-bottom: 1px solid $unnnic-color-fg-base;
    }
  }
}
</style>
