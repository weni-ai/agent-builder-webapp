<template>
  <ImprovementDrawerSection
    testId="affected-conversations"
    :title="$t('audit.improvements.drawer.affected_conversations_title')"
  >
    <template v-if="status === 'loading'">
      <UnnnicSkeletonLoading
        v-for="index in 3"
        :key="index"
        tag="div"
        width="100%"
        height="42px"
        :data-testid="`affected-conversations-skeleton-${index}`"
      />
    </template>

    <template v-else>
      <section
        class="affected-conversations-section__list"
        data-testid="affected-conversations-list"
      >
        <AffectedConversationItem
          v-for="(conversation, index) in results"
          :key="conversation.uuid"
          :conversation="conversation"
          :isExpanded="expandedConversationUuid === conversation.uuid"
          :isFirst="index === 0"
          :isLast="index === results.length - 1"
          @toggle="handleToggle(conversation.uuid)"
          @view-full="handleViewFullConversation(conversation)"
        />
      </section>
    </template>

    <UnnnicPagination
      class="affected-conversations-section__pagination"
      data-testid="affected-conversations-pagination"
      :disabled="status === 'loading'"
      :max="pageLimit"
      :modelValue="page"
      @update:model-value="handlePageUpdate"
    />
  </ImprovementDrawerSection>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import {
  AFFECTED_CONVERSATIONS_PAGE_SIZE,
  useImprovementsStore,
} from '@/store/Improvements';
import { useSupervisorStore } from '@/store/Supervisor';

import ImprovementDrawerSection from './ImprovementDrawerSection.vue';
import AffectedConversationItem from './AffectedConversationItem.vue';

import type { SelectedConversation } from '@/store/types/Conversations.types';
import type { AffectedConversation } from '@/store/types/Improvements.types';

const props = defineProps<{
  open: boolean;
  improvementUuid: string | null;
}>();

const emit = defineEmits<{
  'close-drawer': [];
}>();

const router = useRouter();
const improvementsStore = useImprovementsStore();
const supervisorStore = useSupervisorStore();

const { affectedConversations } = storeToRefs(improvementsStore);

const expandedConversationUuid = ref<string | null>(null);

const status = computed(() => affectedConversations.value.status);
const page = computed(() => affectedConversations.value.page);
const count = computed(() => affectedConversations.value.data.count);
const results = computed(() => affectedConversations.value.data.results);
const pageLimit = computed(() =>
  Math.ceil(count.value / AFFECTED_CONVERSATIONS_PAGE_SIZE),
);

function resetExpandedConversation() {
  expandedConversationUuid.value = results.value[0]?.uuid ?? null;
}

function fetchConversations(pageNumber = 1) {
  if (!props.improvementUuid) return;

  improvementsStore.fetchAffectedConversations(
    props.improvementUuid,
    pageNumber,
  );
}

function handleToggle(conversationUuid: string) {
  expandedConversationUuid.value =
    expandedConversationUuid.value === conversationUuid
      ? null
      : conversationUuid;
}

function handlePageUpdate(newPage: number) {
  fetchConversations(newPage);
}

async function handleViewFullConversation(conversation: AffectedConversation) {
  const selectedConversation: SelectedConversation = {
    uuid: conversation.uuid,
    urn: conversation.contactUrn,
    username: conversation.contactName,
    data: { status: null },
  };

  supervisorStore.selectedConversation = selectedConversation;

  emit('close-drawer');

  await router.replace({
    name: 'conversations',
  });

  supervisorStore.queryConversationUuid = conversation.uuid;
}

watch(
  () => [props.open, props.improvementUuid] as const,
  ([open, improvementUuid]) => {
    if (open && improvementUuid) {
      fetchConversations(1);
      return;
    }

    if (!open) {
      improvementsStore.resetAffectedConversations();
      expandedConversationUuid.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => affectedConversations.value.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'complete' && oldStatus === 'loading') {
      resetExpandedConversation();
    }
  },
);
</script>

<style scoped lang="scss">
.affected-conversations-section {
  &__list {
    display: flex;
    flex-direction: column;
  }

  &__pagination {
    margin-top: $unnnic-space-4;
  }
}
</style>
