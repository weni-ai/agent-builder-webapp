<template>
  <ImprovementDrawerSection
    v-if="improvementDetail && ctaText"
    testId="suggested-solution"
    :title="$t('audit.improvements.drawer.suggested_solution_title')"
  >
    <section class="suggested-solution-content">
      <p data-testid="improvement-drawer-suggested-solution-description">
        {{ improvementDetail.suggestedSolution }}
      </p>

      <section
        v-if="visibleAffectedInstructions.length"
        class="suggested-solution-content__affected-instructions"
      >
        <h3
          v-if="affectedInstructionsTitle"
          class="suggested-solution-content__title"
          data-testid="suggested-solution-affected-instructions-title"
        >
          {{ affectedInstructionsTitle }}
        </h3>

        <ul
          class="suggested-solution-content__affected-instructions-list"
          data-testid="suggested-solution-affected-instructions-list"
        >
          <li
            v-for="instruction in visibleAffectedInstructions"
            :key="instruction.id"
            data-testid="suggested-solution-affected-instruction"
          >
            • "{{ instruction.text }}"
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
import { redirectInParent } from '@/utils/parentRedirect';
import { useProfileStore } from '@/store/Profile.js';
import { UnnnicDisclaimer } from '@weni/unnnic-system';
import type {
  AffectedInstruction,
  RecommendedAction,
} from '@/store/types/Improvements.types';

type ProfileInstruction = {
  id?: number;
  instruction?: string;
};

type VisibleAffectedInstruction = {
  id: number;
  text: string;
};

const emit = defineEmits<{
  'open-contact-support': [];
}>();

const { t } = useI18n();
const profileStore = useProfileStore();

const improvementDetail = computed(
  () => useImprovementsStore().improvementDetail.data,
);
const improvementCategory = computed(() => {
  return improvementDetail.value?.type
    ? getImprovementTypeTag(improvementDetail.value.type).category
    : null;
});

const instructionsUpdatedCount = computed(() => {
  return (
    improvementDetail.value?.affectedInstructions.filter(
      (instruction) => instruction.wasChanged,
    ).length || 0
  );
});
const instructionUpdatedDisclaimer = computed(() =>
  t('audit.improvements.drawer.instruction_updated_disclaimer', {
    count: instructionsUpdatedCount.value,
  }),
);
const affectedInstructionsTitle = computed(() => {
  const titleKeyMap: Record<RecommendedAction, string> = {
    fix_instruction: 'edit_instructions_below',
    remove_instruction: 'remove_instructions_below',
  };

  const recommendedAction = improvementDetail.value?.recommendedAction;

  return recommendedAction
    ? t(`audit.improvements.drawer.${titleKeyMap[recommendedAction]}`)
    : undefined;
});
const ctaText = computed(() => {
  const ctaKeyMap = {
    knowledge: 'go_to_knowledge_base',
    behavior: 'go_to_instructions',
    technical_issue: 'contact_technical_support',
  };

  const key = ctaKeyMap[improvementCategory.value];

  return key ? t(`audit.improvements.drawer.${key}`) : undefined;
});

function getProfileInstructionText(id: number): string {
  const instructions: ProfileInstruction[] =
    profileStore.instructions?.current ?? [];
  const matchedInstruction = instructions.find(
    (instruction) => instruction.id === id,
  );

  return matchedInstruction?.instruction?.trim() ?? '';
}

function toVisibleAffectedInstruction({
  id,
}: AffectedInstruction): VisibleAffectedInstruction | null {
  const text = getProfileInstructionText(id);

  if (!text) {
    return null;
  }

  return { id, text };
}

const visibleAffectedInstructions = computed<VisibleAffectedInstruction[]>(() =>
  (improvementDetail.value?.affectedInstructions ?? [])
    .map(toVisibleAffectedInstruction)
    .filter((instruction) => instruction !== null),
);

function handleCtaClick() {
  if (improvementCategory.value === 'knowledge') {
    redirectInParent({
      path: 'aiBuild:knowledge',
      openInNew: true,
    });
  } else if (improvementCategory.value === 'behavior') {
    redirectInParent({
      path: 'aiAgents:agents/instructions',
      openInNew: true,
    });
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
    @include unnnic-font-emphasis;
    color: $unnnic-color-fg-base;
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
