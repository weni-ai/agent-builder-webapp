<template>
  <section
    :class="[
      'content-base__content-tab',
      `content-base__content-tab--shape-${contentStyle}`,
    ]"
  >
    <section>
      <UnnnicTab
        :tabs="routerTabs.map((e) => e.page)"
        :activeTab="activeTab"
        @change="onTabChange"
      >
        <template
          v-for="tab in routerTabs"
          :key="tab.page"
          #[`tab-head-${tab.page}`]
        >
          {{ $t(`content_bases.tabs.${tab.title}`) }}
        </template>
      </UnnnicTab>
    </section>
    <UnnnicSkeletonLoading
      v-if="
        files.status === 'loading' &&
        files.data.length === 0 &&
        contentStyle !== 'accordion'
      "
      tag="div"
      height="100%"
      class="repository-base-edit__wrapper__card-content"
    />
    <ContentFiles
      v-if="activeTab === 'files'"
      :files="files"
      shape="accordion"
    />
    <ContentSites
      v-if="activeTab === 'sites'"
      :items="sites"
      shape="accordion"
    />
    <template v-if="activeTab === 'text'">
      <ListContentTexts
        v-if="featureFlagsStore.flags.knowledgeTextOrganization"
      />
      <ContentText
        v-else
        v-model="knowledgeStore.contentText"
        :isLoading="textLoading"
        class="content-base__content-tab__text"
      />
    </template>
  </section>
</template>

<script setup>
import { ref, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import ContentFiles from '@/components/Knowledge/ContentFiles.vue';
import ContentSites from '@/components/Knowledge/ContentSites.vue';
import ContentText from '@/components/Knowledge/ContentText.vue';
import ListContentTexts from '@/components/Knowledge/ListContentTexts/index.vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { useKnowledgeStore } from '@/store/Knowledge';

const props = defineProps({
  filesProp: {
    type: Object,
    required: true,
  },
  sitesProp: {
    type: Object,
    required: true,
  },
  textProp: {
    type: Object,
    required: true,
  },
  textLoading: {
    type: Boolean,
  },
});

defineEmits(['update:files']);

const files = toRef(props, 'filesProp');
const sites = toRef(props, 'sitesProp');

const contentStyle = ref('accordion');
const knowledgeStore = useKnowledgeStore();
const featureFlagsStore = useFeatureFlagsStore();

const route = useRoute();
const router = useRouter();

const ALLOWED_TABS = ['files', 'sites', 'text'];
const DEFAULT_TAB = ALLOWED_TABS[0];

const routerTabs = ref([
  { title: 'files', page: 'files' },
  { title: 'sites', page: 'sites' },
  { title: 'text', page: 'text' },
]);

function resolveTabFromQuery(queryTab) {
  return ALLOWED_TABS.includes(queryTab) ? queryTab : DEFAULT_TAB;
}

const activeTab = ref(resolveTabFromQuery(route?.query?.tab));

watch(
  () => route?.query?.tab,
  (next) => {
    const resolved = resolveTabFromQuery(next);
    if (resolved !== activeTab.value) {
      activeTab.value = resolved;
    }
  },
);

const onTabChange = (newTab) => {
  if (!ALLOWED_TABS.includes(newTab) || newTab === activeTab.value) return;

  activeTab.value = newTab;

  router.replace({
    name: 'knowledge',
    query: { ...route.query, tab: newTab },
  });
};
</script>

<style lang="scss" scoped>
.content-base {
  &__container {
    outline-style: solid;
    outline-color: $unnnic-color-neutral-cleanest;
    outline-width: $unnnic-border-width-thinner;
    outline-offset: -$unnnic-border-width-thinner;

    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-sm;

    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__content-tab {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-space-4;

    padding-bottom: $unnnic-space-4;

    &--shape-normal {
      height: 100%;
    }

    :deep(.tab-header) {
      margin-bottom: 0;
    }
  }
}
.search-container {
  margin-top: $unnnic-spacing-xs;
}
</style>
