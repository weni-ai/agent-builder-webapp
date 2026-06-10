<template>
  <header
    class="new-content-text-header"
    data-testid="list-content-texts-header"
  >
    <section class="new-content-text-header__texts">
      <p class="new-content-text-header__title">
        {{ $t('content_bases.new_text.description') }}
      </p>
      <p class="new-content-text-header__supporting_text">
        {{ $t('content_bases.new_text.supporting_text') }}
      </p>
    </section>

    <UnnnicButton
      type="primary"
      :text="$t('content_bases.new_text.button_add_new_text')"
      data-testid="list-content-texts-new-text-button"
      @click="router.push({ name: 'new-content-text' })"
    />

    <UnnnicInput
      v-model="contentTexts.searchTerm"
      class="new-content-text-header__search"
      iconLeft="search"
      :placeholder="$t('content_bases.new_text.search_placeholder')"
      data-testid="list-content-texts-search-input"
    />
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useKnowledgeStore } from '@/store/Knowledge';

const router = useRouter();
const knowledgeStore = useKnowledgeStore();
const { contentTexts } = storeToRefs(knowledgeStore);
</script>

<style lang="scss" scoped>
.new-content-text-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: $unnnic-space-4;
  align-items: center;

  &__title {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
  }

  &__supporting_text {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }

  &__search {
    width: 100%;
    grid-column: 1 / -1;
  }
}
</style>
