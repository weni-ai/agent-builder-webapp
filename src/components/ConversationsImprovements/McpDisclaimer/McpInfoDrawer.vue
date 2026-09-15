<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    lazyMount
    data-testid="mcp-info-drawer"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="mcp-info-drawer-title">
          {{ $t('audit.improvements.mcp_drawer.title') }}
        </UnnnicDrawerTitle>

        <section class="mcp-info-drawer__header-copy">
          <p
            class="mcp-info-drawer__description"
            data-testid="mcp-info-drawer-description"
          >
            {{ $t('audit.improvements.mcp_drawer.description') }}
          </p>
          <p
            class="mcp-info-drawer__mcp-description"
            data-testid="mcp-info-drawer-mcp-description"
          >
            {{ $t('audit.improvements.mcp_drawer.mcp_description') }}
          </p>
        </section>
      </UnnnicDrawerHeader>

      <section
        class="mcp-info-drawer"
        data-testid="mcp-info-drawer-content"
      >
        <section
          class="mcp-info-drawer__what-you-can-do"
          data-testid="mcp-info-drawer-what-you-can-do"
        >
          <h2
            class="mcp-info-drawer__section-title"
            data-testid="mcp-info-drawer-what-you-can-do-title"
          >
            {{ $t('audit.improvements.mcp_drawer.what_you_can_do') }}
          </h2>

          <section
            v-for="group in featureGroups"
            :key="group.testId"
            class="mcp-info-drawer__feature-group"
            :data-testid="group.testId"
          >
            <h3 class="mcp-info-drawer__group-title">
              {{ $t(group.titleKey) }}
            </h3>

            <div
              v-for="feature in group.features"
              :key="feature.id"
              class="mcp-info-drawer__feature-item"
              :data-testid="`mcp-info-drawer-feature-${feature.id}`"
            >
              <div class="mcp-info-drawer__feature-icon">
                <UnnnicIcon
                  :icon="feature.icon"
                  size="ant"
                  scheme="fg-accent"
                  :data-testid="`mcp-info-drawer-feature-icon-${feature.id}`"
                />
              </div>
              <hgroup class="mcp-info-drawer__feature-content">
                <h4 class="mcp-info-drawer__feature-title">
                  {{ featureTitle(feature.id) }}
                </h4>
                <p class="mcp-info-drawer__feature-description">
                  {{ featureDescription(feature.id) }}
                </p>
              </hgroup>
            </div>
          </section>

          <UnnnicDisclaimer
            type="neutral"
            data-testid="mcp-info-drawer-disclaimer"
            :description="$t('audit.improvements.mcp_drawer.disclaimer')"
          />
        </section>

        <section
          class="mcp-info-drawer__how-to-connect"
          data-testid="mcp-info-drawer-how-to-connect"
        >
          <h2
            class="mcp-info-drawer__section-title"
            data-testid="mcp-info-drawer-how-to-connect-title"
          >
            {{ $t('audit.improvements.mcp_drawer.how_to_connect') }}
          </h2>

          <ol class="mcp-info-drawer__steps">
            <li
              v-for="(step, index) in CONNECTION_STEPS"
              :key="step.number"
              class="mcp-info-drawer__step"
              :data-testid="`mcp-info-drawer-step-${step.number}`"
            >
              <div class="mcp-info-drawer__step-indicator">
                <span
                  class="mcp-info-drawer__step-number"
                  :data-testid="`mcp-info-drawer-step-number-${step.number}`"
                >
                  {{ step.number }}
                </span>
                <span
                  v-if="index < CONNECTION_STEPS.length - 1"
                  class="mcp-info-drawer__step-line"
                />
              </div>

              <div class="mcp-info-drawer__step-content">
                <h3 class="mcp-info-drawer__step-title">
                  {{ $t(`audit.improvements.mcp_drawer.${step.titleKey}`) }}
                </h3>

                <UnnnicInput
                  v-if="step.hasCopyField"
                  :modelValue="MCP_SERVER_URL"
                  readonly
                  iconRight="content_copy"
                  :iconRightClickable="true"
                  data-testid="mcp-info-drawer-server-url"
                  @icon-right-click="copyServerUrl"
                />

                <p
                  v-else-if="step.descriptionKey"
                  class="mcp-info-drawer__step-description"
                >
                  {{
                    $t(`audit.improvements.mcp_drawer.${step.descriptionKey}`)
                  }}
                </p>
              </div>
            </li>
          </ol>
        </section>
      </section>

      <UnnnicDrawerFooter data-testid="mcp-info-drawer-footer">
        <UnnnicButton
          type="secondary"
          data-testid="mcp-info-drawer-documentation-button"
          :text="$t('audit.improvements.mcp_drawer.view_documentation')"
          @click="openDocumentation"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useAlertStore } from '@/store/Alert';
import {
  CONNECTION_STEPS,
  DOCUMENTATION_URL,
  IMPROVEMENTS_FEATURES,
  MCP_SERVER_URL,
  PROJECT_FEATURES,
} from './mcpDrawerContent';

defineOptions({
  name: 'McpInfoDrawer',
});

const drawerOpen = defineModel<boolean>('open', {
  required: true,
});

const { t } = useI18n();
const alertStore = useAlertStore();

const featureGroups = [
  {
    testId: 'mcp-info-drawer-improvements-features',
    titleKey: 'audit.improvements.mcp_drawer.with_improvements_backlog',
    features: IMPROVEMENTS_FEATURES,
  },
  {
    testId: 'mcp-info-drawer-project-features',
    titleKey: 'audit.improvements.mcp_drawer.across_your_project',
    features: PROJECT_FEATURES,
  },
];

function featureTitle(id: string) {
  return t(`audit.improvements.mcp_drawer.features.${id}.title`);
}

function featureDescription(id: string) {
  return t(`audit.improvements.mcp_drawer.features.${id}.description`);
}

async function copyServerUrl() {
  try {
    await navigator.clipboard.writeText(MCP_SERVER_URL);
    alertStore.add({
      type: 'informational',
      text: t('audit.improvements.mcp_drawer.copy_success'),
    });
  } catch {
    alertStore.add({
      type: 'error',
      text: t('audit.improvements.mcp_drawer.copy_error'),
    });
  }
}

function openDocumentation() {
  window.open(DOCUMENTATION_URL, '_blank', 'noopener,noreferrer');
}
</script>

<style scoped lang="scss">
.mcp-info-drawer {
  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  overflow-y: auto;

  &__header-copy {
    grid-column: 1 / 3;
    grid-row: 2 / 3;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__description {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__mcp-description {
    @include unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }

  &__what-you-can-do {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    padding-bottom: $unnnic-space-4;
    border-bottom: 1px solid $unnnic-color-border-base;
  }

  &__section-title {
    @include unnnic-font-display-3;
    color: $unnnic-color-fg-emphasized;
  }

  &__feature-group {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-3;
  }

  &__group-title {
    @include unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }

  &__feature-item {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-3;
  }

  &__feature-icon {
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    width: $unnnic-icon-size-10;
    height: $unnnic-icon-size-10;

    background-color: $unnnic-color-bg-accent-plain;
    border-radius: $unnnic-radius-2;
  }

  &__feature-content {
    flex: 1;
    min-width: 0;
  }

  &__feature-title {
    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__feature-description {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__how-to-connect {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-3;
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__step {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-3;
  }

  &__step-indicator {
    flex-shrink: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-space-2;
    align-self: stretch;
  }

  &__step-number {
    display: flex;
    align-items: center;
    justify-content: center;

    width: $unnnic-icon-size-7;
    height: $unnnic-icon-size-7;

    background-color: $unnnic-color-bg-muted;
    border-radius: $unnnic-radius-full;

    @include unnnic-font-action;
    color: $unnnic-color-fg-base;
  }

  &__step-line {
    flex: 1;
    width: 1px;
    min-height: $unnnic-space-2;
    background-color: $unnnic-color-bg-muted;
  }

  &__step-content {
    flex: 1;
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;

    padding-bottom: $unnnic-space-2;
  }

  &__step:last-child &__step-content {
    padding-bottom: 0;
  }

  &__step-title {
    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__step-description {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
