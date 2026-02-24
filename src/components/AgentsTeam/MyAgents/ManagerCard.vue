<template>
  <section :class="['manager-card', { 'manager-card--loading': isLoading }]">
    <AssignAgentCardSkeleton
      v-if="isLoading"
      data-testid="manager-card-skeleton"
    />

    <template v-else>
      <AgentIcon
        :icon="manager.icon"
        class="manager-card__icon"
        data-testid="agent-icon"
      />

      <header class="manager-card__header">
        <p
          class="manager-card__title"
          data-testid="title"
        >
          {{ manager.name }}
        </p>

        <UnnnicTag
          class="manager-card__tag"
          size="small"
          :text="$t('agents.assigned_agents.manager.name')"
          scheme="blue"
          data-testid="agent-tag"
        />

        <p
          v-if="manager.description"
          class="manager-card__description"
          :title="manager.description"
          data-testid="description"
        >
          {{ manager.description }}
        </p>
      </header>

      <footer class="manager-card__actions">
        <!-- TODO: Add actions here -->
        <UnnnicButton
          :text="$t('agents.assigned_agents.manager.edit_manager')"
          type="secondary"
          data-testid="edit-manager-button"
          @click="isOpenEditManagerProfileDrawer = true"
        />
        <UnnnicButton
          :text="$t('agents.assigned_agents.manager.edit_instructions')"
          type="secondary"
          data-testid="edit-instructions-button"
          @click="redirectToInstructionsView"
        />
      </footer>
    </template>
  </section>

  <EditManagerProfileDrawer
    v-model="isOpenEditManagerProfileDrawer"
    data-testid="edit-manager-profile-drawer"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import AgentIcon from '../AgentIcon.vue';
import AssignAgentCardSkeleton from '../AssignAgentCardSkeleton.vue';
import EditManagerProfileDrawer from '@/components/Sidebar/EditManagerProfileDrawer.vue';

import { useProfileStore } from '@/store/Profile';
import { useRouter } from 'vue-router';

const router = useRouter();

const profileStore = useProfileStore();

const isOpenEditManagerProfileDrawer = ref(false);

const isLoading = computed(() => profileStore.status === 'loading');
const manager = computed(() => ({
  name: profileStore.name.old,
  description: profileStore.goal.old,
  icon: 'Manager',
}));

function redirectToInstructionsView() {
  router.push({ name: 'instructions' });
}
</script>

<style lang="scss" scoped>
.manager-card {
  padding: $unnnic-space-4;

  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: $unnnic-space-3;
  row-gap: $unnnic-space-4;

  border-radius: $unnnic-radius-4;
  border: 1px solid $unnnic-color-border-base;

  &--loading {
    grid-template: none;
  }

  &__icon {
    width: $unnnic-icon-size-xl;
    height: auto;
    aspect-ratio: 1/1;

    align-self: center;
  }

  &__header {
    grid-column: 2 / 3;

    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: $unnnic-space-2;
    row-gap: $unnnic-space-1;

    .manager-card__title {
      color: $unnnic-color-fg-emphasized;
      font: $unnnic-font-display-3;
    }

    .manager-card__tag {
      grid-column: 2 / 3;
    }

    .manager-card__description {
      grid-column: 1 / 3;
      grid-row: 2 / 3;

      color: $unnnic-color-fg-base;
      font: $unnnic-font-body;
    }
  }

  &__actions {
    grid-column: 1 / 3;
    grid-row: 2 / 3;

    display: flex;
    gap: $unnnic-space-4;
  }
}
</style>
