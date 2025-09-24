<template>
  <section class="question-and-answer">
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        data-testid="skeleton-question"
        class="question-and-answer__skeleton-question"
        tag="div"
        width="100%"
        height="60px"
      />
      <UnnnicSkeletonLoading
        data-testid="skeleton-answer"
        class="question-and-answer__skeleton-answer"
        tag="div"
        width="100%"
        height="60px"
      />
    </template>

    <ForwardedHumanSupport
      v-else-if="data.forwarded_human_support"
      class="question-and-answer__forwarded-human-support"
      data-testid="forwarded-human-support"
    />

    <template v-else>
      <Message
        v-if="data?.source_type === 'user'"
        class="question-and-answer__question"
        data-testid="question"
        :content="data"
      />

      <section
        v-if="data?.source_type === 'agent'"
        class="question-and-answer__answer"
        data-testid="answer"
      >
        <PreviewLogs
          v-if="showLogs"
          :logs="logs"
          logsSide="right"
          data-testid="preview-logs"
        />

        <Message
          v-for="(content, index) in messagesToShow"
          :key="index"
          class="question-and-answer__answer-text"
          data-testid="answer-text"
          :content="content"
          scheme="success"
        >
          <ViewLogsButton
            :disabled="loadingLogs"
            :loading="loadingLogs"
            :active="showLogs"
            data-testid="view-logs-button"
            @click="handleShowLogs"
          />
        </Message>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import PreviewLogs from '@/components/Preview/PreviewLogs.vue';
import ForwardedHumanSupport from './ForwardedHumanSupport.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import Message from './Message.vue';
import ViewLogsButton from './ViewLogsButton.vue';
import { processLog } from '@/utils/previewLogs';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const messagesToShow = computed(() => {
  return treatedData.value?.components?.length > 0
    ? treatedData.value.components.map((c) => c.msg)
    : [treatedData.value];
});

const extractedComponents = computed(() => {
  const rawComponents = props.data.text.split('}}\n\n');

  return rawComponents
    .map((component, index) => {
      const isLast = index === rawComponents.length - 1;
      const completeComponent = isLast ? component : component + '}}\n\n';

      try {
        return JSON.parse(completeComponent);
      } catch {
        return null;
      }
    })
    .filter((component) => component !== null);
});

const treatedData = computed(() => {
  const components = extractedComponents.value;

  if (components.length > 0) {
    return {
      ...props.data,
      components,
    };
  }

  return props.data;
});

const supervisorStore = useSupervisorStore();

const showLogs = ref(false);
const loadingLogs = ref(false);
const logs = ref([]);

function handleShowLogs() {
  if (loadingLogs.value) return;

  if (logs.value.length) {
    showLogs.value = !showLogs.value;
    return;
  }

  loadLogs();
}

async function loadLogs() {
  loadingLogs.value = true;

  try {
    const responseLogs = await supervisorStore.loadLogs({
      messageId: props.data.id,
    });

    let collaborator = '';
    logs.value = responseLogs.map((log) => {
      const proccesedLog = processLog({
        log,
        currentAgent: collaborator,
      });

      collaborator = proccesedLog.config.currentAgent;

      return proccesedLog;
    });
    showLogs.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    loadingLogs.value = false;
  }
}

watch(
  () => props.data.id,
  () => {
    showLogs.value = false;
    logs.value = [];
  },
);
</script>

<style lang="scss" scoped>
.question-and-answer {
  margin-bottom: $unnnic-spacing-xs;

  display: grid;
  grid-template-columns: repeat(3, 1fr);

  &__question,
  &__skeleton-question {
    grid-column: 1 / span 2;
    grid-row: 1;
  }

  &__answer,
  &__skeleton-answer {
    grid-column: 2 / span 2;
    grid-row: 2;
  }

  &__answer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $unnnic-spacing-nano;
    justify-self: end;

    width: fit-content;

    &-text {
      justify-self: flex-end;
      padding: $unnnic-spacing-ant;
      background-color: $unnnic-color-weni-600;
      color: $unnnic-color-neutral-white;
    }

    .answer__inspect-response {
      width: 100%;
    }
  }

  &__forwarded-human-support {
    grid-column: 1 / 4;
  }
}
</style>
