<template>
  <section class="instructions-section">
    <h2
      class="instructions-section__title"
      data-testid="instructions-section-title"
    >
      {{ $t('agent_builder.instructions.instructions_list.title') }}
    </h2>

    <UnnnicTab
      :tabs="tabs"
      :activeTab="activeTab"
      data-testid="instructions-section-tab"
      @change="instructionsStore.activeInstructionsListTab = $event"
    >
      <template
        v-for="tab in tabs"
        :key="tab"
        #[`tab-head-${tab}`]
      >
        {{ $t(`agent_builder.instructions.instructions_list.tabs.${tab}`) }}
      </template>
      <template #[`tab-panel-${activeTab}`]>
        <p class="instructions-section__tab-description">
          {{
            $t(
              `agent_builder.instructions.instructions_list.tabs.${activeTab}_description`,
            )
          }}
        </p>
      </template>
    </UnnnicTab>
    <CustomInstructionsSection v-if="activeTab === 'custom'" />
    <InstructionsList
      v-if="activeTab === 'default'"
      data-testid="instructions-default"
      :instructions="instructionsDefault"
      :isLoading="false"
      :showActions="false"
    />
    <InstructionsList
      v-if="activeTab === 'safety_topics'"
      data-testid="instructions-safety-topics"
      :instructions="instructionsSafetyTopics"
      :isLoading="false"
      :showActions="false"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useInstructionsStore } from '@/store/Instructions';

import CustomInstructionsSection from './CustomInstructionsSection.vue';
import InstructionsList from './InstructionsList.vue';
import i18n from '@/utils/plugins/i18n';

const instructionsStore = useInstructionsStore();

if (instructionsStore.instructions.status === null) {
  instructionsStore.loadInstructions();
}

const tabs = ref(['custom', 'default', 'safety_topics']);
const activeTab = computed(() => instructionsStore.activeInstructionsListTab);

function generateMockedInstructions(type) {
  return i18n.global
    .tm(`agent_builder.instructions.instructions_list.${type}`)
    .map((instruction, index) => ({
      id: `${type}-${index}`,
      text: instruction,
    }));
}

const instructionsDefault = computed(() =>
  generateMockedInstructions('default_instructions'),
);

const instructionsSafetyTopics = computed(() =>
  generateMockedInstructions('safety_topics'),
);
</script>

<style lang="scss" scoped>
.instructions-section {
  display: flex;
  flex-direction: column;

  height: 100%;

  &__title {
    margin: 0 0 $unnnic-spacing-sm;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__tab-description {
    margin-bottom: $unnnic-space-4;

    color: $unnnic-color-fg-base;

    font: $unnnic-font-body;
  }
}
</style>
