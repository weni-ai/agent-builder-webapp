<template>
  <UnnnicDrawerNext
    :open="modelValue"
    lazyMount
    data-testid="safety-guardrails-drawer"
    @update:open="onOpenChange"
  >
    <UnnnicDrawerContent size="large">
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle data-testid="safety-guardrails-drawer-title">
          {{ $t('agents.instructions.safety_guardrails.drawer.title') }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section
        class="safety-guardrails-drawer"
        data-testid="safety-guardrails-drawer-content"
      >
        <p
          class="safety-guardrails-drawer__description"
          data-testid="safety-guardrails-drawer-description"
        >
          {{ $t('agents.instructions.safety_guardrails.drawer.description') }}
        </p>

        <SafetyGuardrailsTopicList
          :topics="draftTopics"
          @update:topic-enabled="onTopicEnabledChange"
        />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            data-testid="safety-guardrails-drawer-cancel"
            :text="$t('cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          data-testid="safety-guardrails-drawer-save"
          :text="$t('agents.instructions.safety_guardrails.save')"
          type="primary"
          :disabled="!isDirty"
          @click="close"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { getMockGuardrailsConfig } from '@/api/mocks/guardrailsConfig';

import SafetyGuardrailsTopicList from './SafetyGuardrailsTopicList.vue';

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const draftTopics = ref([]);
const snapshotTopics = ref([]);

const isDirty = computed(() => {
  return draftTopics.value.some((topic, index) => {
    return topic.enabled !== snapshotTopics.value[index]?.enabled;
  });
});

watch(
  modelValue,
  (isOpen) => {
    if (isOpen) loadDraftFromMock();
  },
  { immediate: true },
);

function loadDraftFromMock() {
  const config = getMockGuardrailsConfig();

  draftTopics.value = config.topics;
  snapshotTopics.value = structuredClone(config.topics);
}

function onTopicEnabledChange({ id, enabled }) {
  const topic = draftTopics.value.find((item) => item.id === id);
  if (topic) topic.enabled = enabled;
}

function close() {
  modelValue.value = false;
}

function onOpenChange(open) {
  if (!open) close();
}
</script>

<style lang="scss" scoped>
.safety-guardrails-drawer {
  height: 100%;

  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  overflow-y: auto;

  &__description {
    margin: 0;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
