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
          {{ $t('audit.improvements.drawer.affected_instructions_title') }}
        </h3>

        <ul class="suggested-solution-content__affected-instructions-list">
          <li
            v-for="instruction in improvementDetail.affectedInstructions"
            :key="instruction.id"
          >
            • "{{ getInstructionById(instruction.id)?.instruction }}"
          </li>
        </ul>

        <UnnnicDisclaimer
          v-if="instructionsUpdatedCount > 0"
          class="suggested-solution-content__affected-instructions-disclaimer"
          :description="instructionUpdatedDisclaimer"
        />
      </section>

      <UnnnicButton
        class="suggested-solution-content__cta"
        data-testid="suggested-solution-cta"
        :text="ctaText"
        type="secondary"
        @click="handleCtaClick"
      />
    </section>
  </ImprovementDrawerSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useImprovementsStore } from '@/store/Improvements';

import ImprovementDrawerSection from './ImprovementDrawerSection.vue';
import { getImprovementTypeTag } from '@/utils/improvements/getImprovementTypeTag';
import { useProfileStore } from '@/store/Profile.js';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

const emit = defineEmits<{
  'open-contact-support': [];
}>();

const { t } = useI18n();

const improvementDetail = computed(
  () => useImprovementsStore().improvementDetail.data,
);
const improvementCategory = computed(() => {
  return improvementDetail.value?.type
    ? getImprovementTypeTag(improvementDetail.value.type).category
    : null;
});

const suggestedSolutionTitle = computed(() => {
  const titleKeyMap = {
    knowledge: 'suggested_solution_knowledge_title',
    behavior: 'suggested_solution_behavior_title',
    technical_issue: 'suggested_solution_technical_issue_title',
  };

  const key = titleKeyMap[improvementCategory.value];

  return key ? t(`audit.improvements.drawer.${key}`) : undefined;
});
const instructionsUpdatedCount = computed(() => {
  return improvementDetail.value?.affectedInstructions.filter(
    (instruction) => instruction.wasChanged,
  ).length;
});
const instructionUpdatedDisclaimer = computed(() =>
  t('audit.improvements.drawer.instruction_updated_disclaimer', {
    count: instructionsUpdatedCount.value,
  }),
);
const ctaText = computed(() => {
  const ctaKeyMap = {
    knowledge: 'go_to_knowledge_base',
    behavior: 'go_to_instructions',
    technical_issue: 'contact_technical_support',
  };

  const key = ctaKeyMap[improvementCategory.value];

  return key ? t(`audit.improvements.drawer.${key}`) : undefined;
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
        path: 'aiAgents:agents/instructions',
      },
      '*',
    );
  } else if (improvementCategory.value === 'technical_issue') {
    emit('open-contact-support');
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

  &__affected-instructions-disclaimer {
    margin-top: $unnnic-space-2;
  }

  &__cta {
    width: fit-content;
  }
}
</style>
