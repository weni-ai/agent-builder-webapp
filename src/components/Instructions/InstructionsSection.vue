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
    <InstructionsList
      v-if="activeTab === 'custom'"
      data-testid="instructions-custom"
      :instructions="instructionsStore.instructions.data"
      :isLoading="instructionsStore.instructions.status === 'loading'"
      showActions
    />
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

  &__title {
    margin: 0 0 $unnnic-spacing-sm;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__tab-description {
    margin-bottom: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-cloudy;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
