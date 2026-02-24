<template>
  <section
    :class="['sidebar-header', { 'sidebar-header--loading': isLoading }]"
    data-testid="sidebar-header"
    @click="openDrawer"
  >
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        class="sidebar-header__skeleton"
        tag="div"
        width="100%"
        height="20px"
        data-testid="sidebar-header-skeleton"
      />
      <UnnnicSkeletonLoading
        class="sidebar-header__skeleton"
        tag="div"
        width="100%"
        height="18px"
        data-testid="sidebar-header-skeleton"
      />
    </template>
    <template v-else>
      <h1
        class="sidebar-header__title"
        data-testid="sidebar-header-title"
      >
        {{ profileStore.name.old }}
      </h1>
      <p
        class="sidebar-header__description"
        data-testid="sidebar-header-description"
      >
        {{ $t('profile.edit_manager_profile') }}
      </p>
    </template>
  </section>

  <EditManagerProfileDrawer
    v-model="isOpenEditManagerProfileDrawer"
    data-testid="edit-manager-profile-drawer"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProfileStore } from '@/store/Profile';

import EditManagerProfileDrawer from '@/components/AgentsTeam/MyAgents/EditManagerProfileDrawer.vue';

const profileStore = useProfileStore();
const isOpenEditManagerProfileDrawer = ref(false);
const isLoading = computed(() => profileStore.status === 'loading');

function openDrawer() {
  if (isLoading.value) return;
  isOpenEditManagerProfileDrawer.value = true;
}
</script>

<style lang="scss" scoped>
.sidebar-header {
  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-sm;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover:not(&--loading) {
    cursor: pointer;
    background-color: $unnnic-color-bg-soft;
  }

  &--loading {
    gap: $unnnic-spacing-nano;
  }

  &__title {
    margin: 0;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__description {
    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__skeleton {
    display: flex;
  }
}
</style>
