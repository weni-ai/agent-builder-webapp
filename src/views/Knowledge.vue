<template>
  <section class="knowledge">
    <AgentBuilderHeader
      data-testid="knowledge-header"
      :withDivider="false"
      actionsSize="none"
    />

    <RouterContentBase
      data-testid="router-content-base"
      :filesProp="files"
      :sitesProp="sites"
      :textProp="text"
      :textLoading="text.status === 'loading'"
      @update:files="(v) => (files = v)"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { get } from 'lodash';

import nexusaiAPI from '@/api/nexusaiAPI';

import { useProjectStore } from '@/store/Project';
import { useKnowledgeStore } from '@/store/Knowledge';

import RouterContentBase from '@/components/Knowledge/RouterContentBase.vue';
import { useFilesPagination } from '@/composables/useFilesPagination';
import { useSitesPagination } from '@/composables/useSitesPagination';

import AgentBuilderHeader from '@/components/Header.vue';

const projectStore = useProjectStore();
const knowledgeStore = useKnowledgeStore();

const text = ref({
  open: true,
  status: null,
  uuid: null,
  oldValue: '',
  value: '',
});

const contentBaseUuid = computed(
  () => projectStore.details.contentBaseUuid,
);

const files = useFilesPagination({
    contentBaseUuid: contentBaseUuid.value,
  });

const sites = useSitesPagination({
    contentBaseUuid: contentBaseUuid.value,
  });

async function loadContentBaseText() {
  text.value.status = 'loading';

  const { data: contentBaseTextsData } =
    await nexusaiAPI.intelligences.contentBases.texts.list({
      contentBaseUuid: contentBaseUuid.value,
    });

  const textData = get(contentBaseTextsData, 'results.0.text', '');
  const uuid = get(contentBaseTextsData, 'results.0.uuid', '');

  knowledgeStore.contentText.uuid = text.value.uuid = uuid;
  const textValue = textData === '--empty--' ? '' : textData;

  knowledgeStore.contentText.current = knowledgeStore.contentText.old =
    textValue;

  text.value.value = textValue;
  text.value.oldValue = textValue;
  text.value.status = null;
}

onMounted(() => {
  loadContentBaseText();
  files.loadNext();
  sites.loadNext();
});
</script>

<style lang="scss" scoped>
.knowledge {
  height: 100%;
  width: 100%;

  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-spacing-md;
}
</style>
