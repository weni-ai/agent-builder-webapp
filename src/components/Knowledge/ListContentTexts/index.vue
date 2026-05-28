<template>
  <section
    :class="[
      'list-content-texts',
      { 'list-content-texts--empty': showEmptyState },
    ]"
  >
    <section
      v-if="showEmptyState"
      class="list-content-texts__empty"
      data-testid="list-content-texts-empty-state"
    >
      <section class="list-content-texts__empty-content">
        <p
          class="list-content-texts__empty-title"
          data-testid="list-content-texts-empty-state-title"
        >
          {{ $t('content_bases.new_text.empty_state.title') }}
        </p>
        <p
          class="list-content-texts__empty-description"
          data-testid="list-content-texts-empty-state-description"
        >
          {{ $t('content_bases.new_text.empty_state.description') }}
        </p>
      </section>

      <UnnnicButton
        type="primary"
        iconLeft="add"
        :text="$t('content_bases.new_text.button_add_new_text')"
        data-testid="list-content-texts-empty-state-new-text-button"
        @click="goToNewContentText"
      />
    </section>

    <template v-else>
      <NewContentTextHeader />
      <List />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import NewContentTextHeader from './Header.vue';
import List from './List.vue';

import { useKnowledgeStore } from '@/store/Knowledge';

const router = useRouter();
const knowledgeStore = useKnowledgeStore();
const { contentTexts } = storeToRefs(knowledgeStore);

const showEmptyState = computed(
  () =>
    contentTexts.value.data.length === 0 &&
    contentTexts.value.status === 'complete' &&
    !contentTexts.value.searchTerm &&
    contentTexts.value.next === null,
);

const goToNewContentText = () => {
  router.push({ name: 'new-content-text' });
};

onMounted(() => {
  if (knowledgeStore.contentTexts.data.length === 0) {
    knowledgeStore.loadContentTexts();
  }
});
</script>

<style lang="scss" scoped>
.list-content-texts {
  display: grid;
  gap: $unnnic-space-4;

  &--empty {
    height: 100%;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-4;

    width: 100%;
    height: 100%;
  }

  &__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-space-1;
  }

  &__empty-title {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
  }

  &__empty-description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
    text-align: center;
  }
}
</style>
