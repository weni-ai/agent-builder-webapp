<template>
  <header class="new-content-text-header">
    <section>
      <p class="new-content-text-header__title">
        {{ $t('content_bases.new_text.description') }}
      </p>
      <p class="new-content-text-header__supporting_text">
        {{ $t('content_bases.new_text.supporting_text') }}
      </p>
    </section>
    <section>
      <UnnnicButton
        type="primary"
        iconLeft="add"
        :text="$t('content_bases.new_text.button_add_new_text')"
        @click="router.push({ name: 'new-content-text' })"
      />
    </section>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.new-content-text-header {
  display: flex;
  gap: $unnnic-space-4;
  align-items: center;
  justify-content: space-between;

  &__title {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
  }

  &__supporting_text {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-muted;
  }
}
</style>
