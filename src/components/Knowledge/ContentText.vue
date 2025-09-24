<template>
  <section class="content-text__container">
    <header>
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-gt"
        weight="400"
      >
        {{ $t('content_bases.text.description') }}
      </UnnnicIntelligenceText>
    </header>

    <BasesFormText
      v-model="modelValue.current"
      useUpdate
      :item="{
        isLoading,
        uuid: knowledgeStore.contentText.uuid,
        oldValue: knowledgeStore.contentText.old,
      }"
      @update:uuid="knowledgeStore.contentText.uuid = $event"
      @update:old-value="knowledgeStore.contentText.old = $event"
    />
  </section>
</template>

<script setup>
import BasesFormText from '@/components/Knowledge/BasesFormText.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {};
    },
  },

  isLoading: {
    type: Boolean,
  },
});

const knowledgeStore = useKnowledgeStore();
</script>

<style lang="scss" scoped>
.content-text__container {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: $unnnic-spacing-md;
  height: 100%;
}

.content-text__loading {
  height: 100%;
}
</style>
