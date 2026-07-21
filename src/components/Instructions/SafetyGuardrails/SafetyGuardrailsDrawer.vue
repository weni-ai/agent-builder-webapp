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
          :loading="guardrailsStore.isLoading"
          @update:topic-enabled="onTopicEnabledChange"
        />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicDrawerClose>
          <UnnnicButton
            data-testid="safety-guardrails-drawer-cancel"
            :text="$t('cancel')"
            type="tertiary"
            :disabled="guardrailsStore.isSaving"
            @click="close"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          data-testid="safety-guardrails-drawer-save"
          :text="$t('agents.instructions.safety_guardrails.save')"
          type="primary"
          :disabled="!canSave"
          :loading="guardrailsStore.isSaving"
          @click="save"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { useGuardrailsConfigStore } from '@/store/GuardrailsConfig';

import SafetyGuardrailsTopicList from './SafetyGuardrailsTopicList.vue';

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const guardrailsStore = useGuardrailsConfigStore();

const draftTopics = ref([]);
const snapshotTopics = ref([]);

const isDirty = computed(() => {
  return draftTopics.value.some((topic, index) => {
    return topic.enabled !== snapshotTopics.value[index]?.enabled;
  });
});

const canSave = computed(() => {
  return (
    isDirty.value &&
    guardrailsStore.writable &&
    !guardrailsStore.isLoading &&
    !guardrailsStore.isSaving
  );
});

watch(
  modelValue,
  (isOpen) => {
    if (isOpen) loadDraft();
  },
  { immediate: true },
);

function cloneTopics(topics) {
  return topics.map((topic) => ({ ...topic }));
}

async function loadDraft() {
  draftTopics.value = [];
  snapshotTopics.value = [];

  try {
    await guardrailsStore.fetchConfig();

    draftTopics.value = cloneTopics(guardrailsStore.topics);
    snapshotTopics.value = cloneTopics(guardrailsStore.topics);
  } catch {
    close();
  }
}

function onTopicEnabledChange({ id, enabled }) {
  if (!guardrailsStore.writable) return;

  const topic = draftTopics.value.find((item) => item.id === id);
  if (topic) topic.enabled = enabled;
}

async function save() {
  if (!canSave.value) return;

  const categoryStates = guardrailsStore.buildCategoryStatesDiff(
    draftTopics.value,
    snapshotTopics.value,
  );

  if (Object.keys(categoryStates).length === 0) return;

  await guardrailsStore.updateConfig({ categoryStates });
  close();
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

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
