<template>
  <section class="new-instruction-drawer__ai-analysis">
    <h2 class="ai-analysis__title">
      {{ aiAnalysisT('title') }}
    </h2>

    <section
      v-if="status === 'loading'"
      class="ai-analysis__loading"
      data-testid="ai-analysis-loading"
    >
      <UnnnicIconLoading size="20px" />

      <p class="ai-analysis__loading-text">
        {{ aiAnalysisT('validating') }}
      </p>
    </section>

    <section
      v-else-if="status === 'error'"
      class="ai-analysis__error"
      data-testid="ai-analysis-error"
    >
      <UnnnicIcon
        icon="cancel"
        size="avatar-nano"
        scheme="fg-critical"
        data-testid="ai-analysis-error-icon"
      />

      <p
        class="ai-analysis__error-text"
        data-testid="ai-analysis-error-text"
      >
        {{ aiAnalysisT('error') }}
      </p>
    </section>

    <section
      v-else-if="status === 'complete'"
      class="ai-analysis__results"
      data-testid="ai-analysis-results"
    >
      <section class="results__suggested-category">
        <h3 class="results__title">
          {{ aiAnalysisT('suggested_category') }}
        </h3>

        <SuggestedCategory />
      </section>
      <section class="results__issues">
        <h3 class="results__title">
          {{ aiAnalysisT('issues') }}
        </h3>

        <IssuesFound />
      </section>
      <section
        v-if="data.suggestion"
        class="results__suggested-rewrite"
      >
        <h3 class="results__title">
          {{ aiAnalysisT('suggested_rewrite') }}
        </h3>

        <SuggestedRewrite />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

import IssuesFound from './IssuesFound.vue';
import SuggestedCategory from './SuggestedCategory.vue';
import SuggestedRewrite from './SuggestedRewrite.vue';

const { t } = useI18n();
const aiAnalysisT = (key: string) =>
  t(`agents.instructions.new_instruction_drawer.ai_analysis.${key}`);

const instructionsStore = useInstructionsStore();
const { data, status } = toRefs(instructionsStore.instructionSuggestedByAI);
</script>

<style lang="scss" scoped>
.new-instruction-drawer__ai-analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  .ai-analysis {
    &__title {
      font: $unnnic-font-display-3;
      color: $unnnic-color-fg-emphasized;
    }

    &__loading {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;
    }

    &__loading-text {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-muted;
    }

    &__error {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;
    }

    &__error-text {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-critical;
    }

    &__results {
      border-radius: $unnnic-radius-2;
      border: 1px solid $unnnic-color-border-base;

      > * {
        border-bottom: 1px solid $unnnic-color-border-base;

        padding: $unnnic-space-4;

        display: flex;
        flex-direction: column;
        gap: $unnnic-space-2;

        &:last-child {
          border-bottom: none;
        }
      }

      .results__title {
        font: $unnnic-font-action;
        color: $unnnic-color-fg-emphasized;
      }
    }
  }
}
</style>
