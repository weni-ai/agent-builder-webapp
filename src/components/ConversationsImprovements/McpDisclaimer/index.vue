<template>
  <section
    class="mcp-disclaimer"
    data-testid="mcp-disclaimer"
  >
    <UnnnicIcon
      data-testid="mcp-disclaimer-icon"
      icon="hugeicons:mcp-server"
      size="md"
      scheme="fg-accent"
    />

    <hgroup class="mcp-disclaimer__content">
      <h3
        class="mcp-disclaimer__title"
        data-testid="mcp-disclaimer-title"
      >
        {{ $t('audit.improvements.mcp_disclaimer.title') }}
      </h3>
      <p
        class="mcp-disclaimer__description"
        data-testid="mcp-disclaimer-description"
      >
        {{ $t('audit.improvements.mcp_disclaimer.description') }}
      </p>
    </hgroup>

    <UnnnicButton
      class="mcp-disclaimer__button"
      type="tertiary"
      data-testid="mcp-disclaimer-button"
      :text="$t('audit.improvements.mcp_disclaimer.button')"
      @click="openDrawer"
    />

    <McpInfoDrawer v-model:open="isDrawerOpen" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import McpInfoDrawer from './McpInfoDrawer.vue';

defineOptions({
  name: 'McpDisclaimer',
});

const isDrawerOpen = ref(false);

function openDrawer() {
  isDrawerOpen.value = true;
}
</script>

<style scoped lang="scss">
.mcp-disclaimer {
  display: flex;
  align-items: center;
  gap: $unnnic-space-2;

  padding: $unnnic-space-4;

  background-color: $unnnic-color-teal-1;
  border: 1px solid $unnnic-color-border-accent-plain;
  border-radius: $unnnic-radius-2;

  &__content {
    flex: 1;
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__title {
    margin: 0;

    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    margin: 0;

    @include unnnic-font-caption-2;
    color: $unnnic-color-fg-emphasized;
  }

  &__button {
    flex-shrink: 0;
  }
}
</style>
