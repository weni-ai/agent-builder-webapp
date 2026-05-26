<template>
  <UnnnicPageHeader
    data-testid="text-detail-header"
    hasBackButton
    @back="$emit('back')"
  >
    <template #infos>
      <section
        class="text-detail-header__infos"
        :class="{
          'text-detail-header__infos--editing': editing,
        }"
      >
        <UnnnicToolTip
          v-if="!editing"
          side="top"
          :text="t('content_bases.new_text.edit_name')"
          enabled
          class="text-detail-header__tooltip"
        >
          <section
            class="text-detail-header__title-wrapper"
            data-testid="text-detail-header-title-wrapper"
            @click="startEditing"
          >
            <h1
              class="text-detail-header__title"
              data-testid="text-detail-header-title"
            >
              {{ displayTitle }}
            </h1>

            <UnnnicIcon
              icon="edit_square"
              size="sm"
              scheme="fg-base"
              clickable
              class="text-detail-header__edit-icon"
              data-testid="text-detail-header-edit-icon"
              @click.stop="startEditing"
            />
          </section>
        </UnnnicToolTip>

        <section
          v-else
          class="text-detail-header__edit"
        >
          <input
            ref="titleInputRef"
            v-model="draft"
            class="text-detail-header__input"
            data-testid="text-detail-header-input"
            :maxlength="MAX_TITLE_LENGTH"
            @keydown.enter.prevent="onEnter"
            @keydown.esc.prevent="onEsc"
            @blur="onBlur"
          />

          <p
            class="text-detail-header__hint"
            data-testid="text-detail-header-hint"
          >
            {{ t('content_bases.new_text.edit_name_hint') }}
          </p>
        </section>
      </section>
    </template>

    <template #actions>
      <section class="text-detail-header__actions">
        <UnnnicButton
          type="primary"
          :text="t('content_bases.new_text.save_changes')"
          :disabled="saveDisabled"
          :loading="saveLoading"
          data-testid="text-detail-header-save-button"
          @click="$emit('save')"
        />

        <UnnnicButton
          type="tertiary"
          iconCenter="more_vert"
          data-testid="text-detail-header-cave-button"
        />
      </section>
    </template>
  </UnnnicPageHeader>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useKnowledgeStore } from '@/store/Knowledge';

const MAX_TITLE_LENGTH = 100;

const props = defineProps({
  uuid: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  defaultTitle: {
    type: String,
    required: true,
  },
  saveLoading: {
    type: Boolean,
    default: false,
  },
  saveDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:title', 'save', 'back']);

const { t } = useI18n();
const knowledgeStore = useKnowledgeStore();

const editing = ref(false);
const draft = ref('');
const escCancelled = ref(false);
const titleInputRef = ref(null);

const displayTitle = computed(() =>
  props.title?.trim() ? props.title : props.defaultTitle,
);

function startEditing() {
  draft.value = displayTitle.value;
  escCancelled.value = false;
  editing.value = true;

  nextTick(() => {
    titleInputRef.value?.focus();
  });
}

function onEnter(event) {
  event.target.blur();
}

function onEsc(event) {
  escCancelled.value = true;
  event.target.blur();
}

async function onBlur() {
  if (!editing.value) return;

  if (escCancelled.value) {
    escCancelled.value = false;
    editing.value = false;
    return;
  }

  const trimmed = draft.value.trim();
  const next = trimmed === '' ? props.defaultTitle : trimmed;

  editing.value = false;

  if (next === props.title) return;

  emit('update:title', next);

  if (props.uuid) {
    try {
      await knowledgeStore.patchContentText(props.uuid, { title: next });
    } catch {
      console.error('Error patching content text');
    }
  }
}
</script>

<style lang="scss" scoped>
.text-detail-header {
  &__infos {
    position: relative;

    :deep(.text-detail-header__tooltip) {
      display: inline-grid;
    }
  }

  &__title-wrapper {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    overflow: hidden;

    cursor: text;

    &:hover .text-detail-header__edit-icon,
    &:focus-within .text-detail-header__edit-icon {
      visibility: visible;
      opacity: 1;
    }
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: $unnnic-color-fg-emphasized;

    font: $unnnic-font-display-1;
  }

  &__edit-icon {
    visibility: hidden;
    opacity: 0;
  }

  &__edit {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__input {
    width: 100%;

    border: none;
    outline: none;
    background: transparent;
    padding: 0;

    color: $unnnic-color-fg-emphasized;

    font: $unnnic-font-display-1;
  }

  &__hint {
    position: absolute;
    top: calc(100% + $unnnic-space-05);

    color: $unnnic-color-fg-base;

    font: $unnnic-font-caption-2;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $unnnic-space-2;
  }
}
</style>
