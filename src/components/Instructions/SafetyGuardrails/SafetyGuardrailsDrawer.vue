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
        <section
          class="safety-guardrails-drawer__description"
          data-testid="safety-guardrails-drawer-description"
        >
          <p>
            {{
              $t(
                'agents.instructions.safety_guardrails.drawer.description.intro',
              )
            }}
          </p>
          <div class="safety-guardrails-drawer__description-states">
            <p>
              {{
                $t(
                  'agents.instructions.safety_guardrails.drawer.description.on',
                )
              }}
            </p>
            <p>
              {{
                $t(
                  'agents.instructions.safety_guardrails.drawer.description.off',
                )
              }}
            </p>
          </div>
        </section>

        <SafetyGuardrailsTopicList
          :topics="draftTopics"
          :loading="guardrailsStore.isLoading"
          @update:topic-enabled="onTopicEnabledChange"
        />

        <div
          v-if="guardrailsStore.isLoading"
          class="safety-guardrails-drawer__description-skeleton"
          data-testid="safety-guardrails-drawer-description-skeleton"
        >
          <UnnnicSkeletonLoading
            tag="div"
            width="135px"
            height="16px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="100%"
            height="90px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="362px"
            height="16px"
          />
        </div>

        <SafetyGuardrailsBlockMessage
          v-else
          v-model="draftBlockMessage"
          :maxLength="BLOCK_MESSAGE_MAX_LENGTH"
        />

        <SafetyGuardrailsManipulationAttempts
          :modelValue="draftPromptInjectionEnabled"
          @update:model-value="onPromptInjectionEnabledChange"
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

  <SafetyGuardrailsAllowTopicsDialog
    v-model:open="isAllowTopicsDialogOpen"
    :topicNames="unblockedTopicNames"
    :loading="guardrailsStore.isSaving"
    @confirm="onConfirmAllowTopics"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useGuardrailsConfigStore } from '@/store/GuardrailsConfig';

import SafetyGuardrailsAllowTopicsDialog from './SafetyGuardrailsAllowTopicsDialog.vue';
import SafetyGuardrailsBlockMessage from './SafetyGuardrailsBlockMessage.vue';
import SafetyGuardrailsManipulationAttempts from './SafetyGuardrailsManipulationAttempts.vue';
import SafetyGuardrailsTopicList from './SafetyGuardrailsTopicList.vue';

const BLOCK_MESSAGE_MAX_LENGTH = 250;

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const { t } = useI18n();
const guardrailsStore = useGuardrailsConfigStore();

const draftTopics = ref([]);
const draftBlockMessage = ref('');
const draftPromptInjectionEnabled = ref(false);
const snapshotTopics = ref([]);
const snapshotBlockMessage = ref('');
const snapshotPromptInjectionEnabled = ref(false);
const isAllowTopicsDialogOpen = ref(false);
const unblockedTopicIds = ref([]);
const isPromptInjectionUnblocked = ref(false);

const unblockedTopicNames = computed(() => {
  const names = unblockedTopicIds.value.map((id) =>
    t(`agents.instructions.safety_guardrails.topics.${id}.name`),
  );

  if (isPromptInjectionUnblocked.value) {
    names.push(
      t(
        'agents.instructions.safety_guardrails.manipulation_attempts.prompt_injection.name',
      ),
    );
  }

  return names;
});

const isDirty = computed(() => {
  if (draftBlockMessage.value !== snapshotBlockMessage.value) return true;
  if (
    draftPromptInjectionEnabled.value !== snapshotPromptInjectionEnabled.value
  ) {
    return true;
  }

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

function getUnblockedTopicIds() {
  return draftTopics.value
    .filter((topic) => {
      const previous = snapshotTopics.value.find(
        (item) => item.id === topic.id,
      );
      return previous?.enabled === true && topic.enabled === false;
    })
    .map((topic) => topic.id);
}

async function loadDraft() {
  draftTopics.value = [];
  draftBlockMessage.value = '';
  draftPromptInjectionEnabled.value = false;
  snapshotTopics.value = [];
  snapshotBlockMessage.value = '';
  snapshotPromptInjectionEnabled.value = false;
  isAllowTopicsDialogOpen.value = false;
  unblockedTopicIds.value = [];
  isPromptInjectionUnblocked.value = false;

  try {
    await guardrailsStore.fetchConfig();

    draftTopics.value = cloneTopics(guardrailsStore.topics);
    draftBlockMessage.value = guardrailsStore.blockingMessage;
    draftPromptInjectionEnabled.value = guardrailsStore.promptInjectionEnabled;
    snapshotTopics.value = cloneTopics(guardrailsStore.topics);
    snapshotBlockMessage.value = guardrailsStore.blockingMessage;
    snapshotPromptInjectionEnabled.value =
      guardrailsStore.promptInjectionEnabled;
  } catch {
    close();
  }
}

function onTopicEnabledChange({ id, enabled }) {
  if (!guardrailsStore.writable) return;

  const topic = draftTopics.value.find((item) => item.id === id);
  if (topic) topic.enabled = enabled;
}

function onPromptInjectionEnabledChange(enabled) {
  if (!guardrailsStore.writable) return;

  draftPromptInjectionEnabled.value = enabled;
}

async function persistChanges() {
  const categoryStates = guardrailsStore.buildCategoryStatesDiff(
    draftTopics.value,
    snapshotTopics.value,
  );
  const blockingMessageChanged =
    draftBlockMessage.value !== snapshotBlockMessage.value;
  const promptInjectionChanged =
    draftPromptInjectionEnabled.value !== snapshotPromptInjectionEnabled.value;

  if (
    Object.keys(categoryStates).length === 0 &&
    !blockingMessageChanged &&
    !promptInjectionChanged
  ) {
    return;
  }

  const payload = {};

  if (Object.keys(categoryStates).length > 0) {
    payload.categoryStates = categoryStates;
  }

  if (blockingMessageChanged) {
    payload.blockingMessage = draftBlockMessage.value;
  }

  if (promptInjectionChanged) {
    payload.promptInjectionEnabled = draftPromptInjectionEnabled.value;
  }

  await guardrailsStore.updateConfig(payload);
  close();
}

async function save() {
  if (!canSave.value) return;

  const unblockedIds = getUnblockedTopicIds();
  const promptInjectionWasUnblocked =
    snapshotPromptInjectionEnabled.value === true &&
    draftPromptInjectionEnabled.value === false;

  if (unblockedIds.length > 0 || promptInjectionWasUnblocked) {
    unblockedTopicIds.value = unblockedIds;
    isPromptInjectionUnblocked.value = promptInjectionWasUnblocked;
    isAllowTopicsDialogOpen.value = true;
    return;
  }

  await persistChanges();
}

async function onConfirmAllowTopics() {
  await persistChanges();
  isAllowTopicsDialogOpen.value = false;
}

function close() {
  isAllowTopicsDialogOpen.value = false;
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
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__description-states,
  &__description-skeleton {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }
}
</style>
