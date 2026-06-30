<template>
  <UnnnicDrawerNext
    v-model:open="drawerOpen"
    data-testid="improvement-drawer"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="improvement-drawer-title">
          {{ improvement?.text }}
        </UnnnicDrawerTitle>

        <section class="improvement-drawer__header-info">
          <UnnnicTag
            class="improvement-drawer__type"
            data-testid="improvement-drawer-type"
            :scheme="typeTag.scheme"
            :text="typeTag.text"
          />

          <p
            class="improvement-drawer__conversations-count"
            data-testid="improvement-drawer-conversations-count"
          >
            {{
              t('audit.improvements.drawer.affected_conversations_count', {
                count: improvement?.conversationsCount ?? 0,
              })
            }}
          </p>
        </section>
      </UnnnicDrawerHeader>

      <section
        class="improvement-drawer"
        data-testid="improvement-drawer-content"
      >
        <!-- TODO: Implement improvement detail drawer in next branch -->
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            :text="$t('audit.improvements.drawer.ignore_improvement')"
            type="tertiary"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          :text="$t('audit.improvements.drawer.mark_as_resolved')"
          type="primary"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { getImprovementTypeTag } from '@/utils/improvements/getImprovementTypeTag';

import type { Improvement } from '@/store/types/Improvements.types';

const drawerOpen = defineModel<boolean>('open', {
  required: true,
});

const props = defineProps<{
  improvement: Improvement | null;
}>();

const { t } = useI18n();

const typeTag = computed(() => {
  const { category, scheme } = getImprovementTypeTag(props.improvement?.type);

  return {
    scheme,
    text: t(`audit.improvements.types.${category}`),
  };
});
</script>

<style scoped lang="scss">
.improvement-drawer {
  &__header-info {
    margin-top: $unnnic-space-1;

    display: flex;
    gap: $unnnic-space-3;
    align-items: center;
  }

  &__conversations-count {
    @include unnnic-font-caption-1;
    color: $unnnic-color-fg-base;
  }
}
</style>
