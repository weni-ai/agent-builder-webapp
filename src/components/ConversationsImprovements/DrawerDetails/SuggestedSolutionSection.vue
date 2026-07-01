<template>
  <ImprovementDrawerSection
    v-if="suggestedSolutionTitle"
    testId="suggested-solution"
    :title="$t('audit.improvements.drawer.suggested_solution_title')"
  >
    <section class="suggested-solution-content">
      <h3 class="suggested-solution-content__title">
        {{ suggestedSolutionTitle }}
      </h3>

      <p data-testid="improvement-drawer-suggested-solution-description">
        {{ improvementDetail?.suggestedSolution }}
      </p>

      <section
        v-if="improvementDetail.affectedInstructions.length"
        class="suggested-solution-content__affected-instructions"
      >
        <h3 class="suggested-solution-content__title">
          Also edit these existing instructions:
        </h3>

        <ul class="suggested-solution-content__affected-instructions-list">
          <li
            v-for="instruction in improvementDetail.affectedInstructions"
            :key="instruction.id"
          >
            "{{ getInstructionById(instruction.id)?.instruction }}"
          </li>
        </ul>
      </section>

      <UnnnicButton
        class="suggested-solution-content__cta"
        :text="ctaText"
        type="secondary"
        @click="handleCtaClick"
      />
    </section>
  </ImprovementDrawerSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useImprovementsStore } from '@/store/Improvements';

import ImprovementDrawerSection from './ImprovementDrawerSection.vue';
import { getImprovementTypeTag } from '@/utils/improvements/getImprovementTypeTag';
import { useProfileStore } from '@/store/Profile.js';

const improvementDetail = computed(
  () => useImprovementsStore().improvementDetail.data,
);
const improvementCategory = computed(() => {
  return improvementDetail.value?.type
    ? getImprovementTypeTag(improvementDetail.value.type).category
    : null;
});

const suggestedSolutionTitle = computed(() => {
  const titleMap = {
    knowledge: 'New content for Knowledge Base',
    behavior: 'Add this instruction to the Manager:',
    technical_issue: 'Recommended action',
  };

  return titleMap[improvementCategory.value];
});
const ctaText = computed(() => {
  const textMap = {
    knowledge: 'Go to Knowledge Base',
    behavior: 'Go to Instructions',
    technical_issue: 'Contact technical support',
  };

  return textMap[improvementCategory.value];
});

const getInstructionById = (id: number) => {
  return useProfileStore().instructions.current.find(
    (instruction) => instruction.id === id,
  );
};

function handleCtaClick() {
  if (improvementCategory.value === 'knowledge') {
    window.parent.postMessage(
      {
        event: 'redirect',
        path: 'aiBuild',
      },
      '*',
    );
  } else if (improvementCategory.value === 'behavior') {
    window.parent.postMessage(
      {
        event: 'redirect',
        path: 'aiAgents:instructions',
      },
      '*',
    );
  } else if (improvementCategory.value === 'technical_issue') {
    console.log('contact technical support');
  }
}
</script>

<style scoped lang="scss">
.suggested-solution-content {
  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-radius-2;
  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &__title {
    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__affected-instructions {
    margin: $unnnic-space-2 0;
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__cta {
    width: fit-content;
  }
}
</style>
