<template>
  <section
    ref="logList"
    data-testid="preview-logs"
    :class="`preview-logs preview-logs--${props.logsSide}`"
  >
    <p
      v-if="!processedLogs.length"
      class="preview-logs__empty"
      data-testid="preview-logs-empty"
    >
      {{ $t('router.preview.no_logs_registered') }}
    </p>

    <TransitionGroup
      :class="`preview-logs__logs preview-logs__logs--${props.logsSide}`"
      name="logs"
      tag="ol"
      @before-enter="updateProgressBarHeight('agent')"
    >
      <li
        v-for="(log, logIndex) in processedLogs"
        :key="logIndex"
        :class="`logs__log logs__log--${props.logsSide}`"
        data-testid="preview-logs-log"
      >
        <p
          :class="`log__agent-name log__agent-name--${props.logsSide}`"
          data-testid="preview-logs-log-agent-name"
        >
          {{ log.agent }}
        </p>

        <TransitionGroup
          name="steps"
          tag="ol"
          class="log__steps"
          @before-enter="updateProgressBarHeight('step')"
          @before-leave="updateProgressBarHeight('step')"
        >
          <li
            v-for="(step, stepIndex) in log.steps"
            :key="stepIndex"
            :class="`steps__step steps__step--${props.logsSide}`"
            data-testid="preview-logs-log-step"
          >
            <section
              v-if="step.log?.config?.icon"
              class="steps__step-icon"
              data-testid="preview-logs-log-step-icon"
            >
              <UnnnicIcon
                class="step-icon__background"
                icon="circle"
                size="lg"
                filled
              />

              <UnnnicIcon
                class="step-icon__icon"
                data-testid="preview-logs-log-step-icon-icon"
                :icon="step.log.config?.icon"
                size="sm"
                scheme="neutral-cloudy"
              />
            </section>
            <p>{{ step.title }}</p>
            <button
              v-if="step.log?.data"
              class="step__see-full"
              data-testid="preview-logs-log-step-see-full"
              @click="openModalLogFullDetails(step.title, step.log)"
            >
              {{ $t('router.preview.see_full_details') }}
            </button>
          </li>
        </TransitionGroup>
      </li>
    </TransitionGroup>

    <article
      :class="`preview-logs__progress-bar preview-logs__progress-bar--${props.logsSide}`"
      data-testid="preview-logs-progress-bar"
    />

    <PreviewLogsDetailsModal
      v-model="showDetailsModal"
      :title="selectedLog.summary"
      :log="selectedLog.log"
      data-testid="preview-logs-details-modal"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import PreviewLogsDetailsModal from './PreviewLogsDetailsModal.vue';

const emit = defineEmits(['scroll-to-bottom']);

const props = defineProps({
  logs: {
    type: Array,
    required: true,
  },
  logsSide: {
    type: String,
    default: 'left',
    validator(value) {
      return ['left', 'right'].includes(value);
    },
  },
  agents: {
    type: Object,
    default: () => ({
      agents: [],
      manager: {},
    }),
  },
});

const agentsTeamStore = useAgentsTeamStore();

const showDetailsModal = ref(false);
const selectedLog = ref({
  summary: '',
  log: '',
});

const processedLogs = computed(() => {
  const allAgents =
    Object.keys(props.agents.manager).length && props.agents.agents.length
      ? props.agents
      : agentsTeamStore.allAgents;
  if (!allAgents) return [];

  const logs = props.logs;
  const { agents, manager } = allAgents;

  return logs.reduce((logsByAgent, log) => {
    const { agentName = '' } = log.config || {};

    const agent = agents.find((agent) => agent.id === agentName) || manager;

    if (!agent) return logsByAgent;

    const lastLog = logsByAgent.at(-1);
    if (lastLog?.id !== agent.id) {
      logsByAgent.push({
        id: agent.id,
        agent: agent.name || 'Manager',
        steps: [],
      });
    }

    logsByAgent.at(-1)?.steps.push({
      title: getLogSummary(log) || 'Unknown',
      log,
    });
    return logsByAgent;
  }, []);
});

function getLogSummary(log) {
  if (log.config?.summary) {
    return log.config.summary;
  }

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function formatLogKey(key) {
    return key
      .split(/(?=[A-Z])|_/)
      .map(capitalizeWord)
      .join(' ');
  }

  function findTraceKey(trace) {
    if (!trace) return;

    return Object.keys(trace).find((key) =>
      key.toLowerCase().includes('trace'),
    );
  }

  if (!log.data || typeof log.data !== 'object') {
    return 'Unknown';
  }

  const logKey = findTraceKey(log.data.trace || log.data);
  return logKey ? formatLogKey(logKey) : 'Unknown';
}

const progressHeight = ref(0);

onMounted(() => {
  nextTick(() => {
    updateProgressBarHeight('mount');
  });
});

function openModalLogFullDetails(summary, log) {
  selectedLog.value = { summary, log };
  showDetailsModal.value = true;
}

const logTranslateY = 24;

function updateProgressBarHeight(type = 'agent') {
  setTimeout(() => {
    if (!['mount', 'agent', 'step'].includes(type)) {
      throw new Error('Invalid type passed to updateProgressHeight function');
    }

    const logList = document.querySelector('.preview-logs');
    if (!logList) return;

    const firstLog = logList.querySelector('.log__agent-name:first-child');
    const lastLog = logList.querySelector(
      '.logs__log:last-child .steps__step:last-child p',
    );

    if (firstLog && lastLog) {
      const firstLogRect = firstLog.getBoundingClientRect();
      const lastLogRect = lastLog.getBoundingClientRect();
      const animationOffset = type === 'agent' ? logTranslateY : 0;
      progressHeight.value =
        animationOffset +
        lastLogRect.bottom -
        firstLogRect.top -
        firstLogRect.height / 2 -
        lastLogRect.height / 2;
    }

    emit('scroll-to-bottom');
  }, 200);
}

watch(
  () => props.logs,
  (newLogs) => {
    if (newLogs.length === 0) {
      progressHeight.value = 0;
    }
  },
);
</script>

<style scoped lang="scss">
.logs-enter-active {
  transition: all 0.2s ease-out;
}
.logs-enter-from {
  $logTranslateY: -24px;
  opacity: 0;
  transform: translateY($logTranslateY);
}

.steps-enter-active {
  transition: all 0.2s ease-out;
}
.steps-enter-from {
  opacity: 0;
}

.preview-logs {
  position: relative;

  .preview-logs__empty {
    margin: 0;
    padding: 0;

    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  .preview-logs__logs {
    position: relative;

    margin: 0;

    padding: 0;

    list-style: none;

    &--left {
      margin-left: $unnnic-spacing-sm;
    }

    &--right {
      text-align: end;
      margin-right: $unnnic-spacing-sm;
    }

    .logs__log {
      margin-bottom: $unnnic-spacing-sm;

      $progressDotOffset: -($unnnic-spacing-sm + $unnnic-spacing-nano);
      %progressDot {
        &::before {
          content: '•';

          position: absolute;
          z-index: 1;

          color: $unnnic-color-neutral-cleanest;
        }
      }

      .log__agent-name {
        margin-bottom: $unnnic-spacing-xs;

        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-bold;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

        @extend %progressDot;

        &--left {
          &::before {
            left: $progressDotOffset;
          }
        }

        &--right {
          &::before {
            right: $progressDotOffset + 0.5px;
          }
        }
      }

      .log__steps {
        margin: 0;
        margin-left: $unnnic-spacing-md - $unnnic-spacing-ant;

        padding: 0;

        display: grid;
        gap: $unnnic-spacing-sm;

        list-style: none;

        .steps__step {
          $lineHeight: $unnnic-font-size-body-gt + $unnnic-line-height-md;

          position: relative;

          color: $unnnic-color-neutral-cloudy;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          line-height: $lineHeight;

          &:first-letter {
            text-transform: uppercase;
          }

          .steps__step-icon {
            position: absolute;
            top: calc($lineHeight / 8);

            z-index: 2;

            display: grid;
            place-items: center;

            .step-icon__background {
              color: $unnnic-color-neutral-white;
              position: absolute;
              z-index: -1;
            }
          }

          &--left {
            .steps__step-icon {
              left: -($unnnic-spacing-xl) + 4.5;
            }
          }

          &--right {
            .steps__step-icon {
              right: -($unnnic-spacing-md) + 1;
            }
          }

          .step__see-full {
            padding: 0;
            border: none;
            background-color: transparent;

            color: $unnnic-color-neutral-clean;

            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-body-md;
            line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

            cursor: pointer;
          }
        }
      }

      &:last-child {
        .steps__step:last-of-type {
          color: $unnnic-color-weni-600;

          .step-icon__icon {
            color: $unnnic-color-weni-600;
          }

          .step__see-full {
            color: $unnnic-color-weni-600;
          }
        }
      }
    }
  }

  .preview-logs__progress-bar {
    position: absolute;
    top: calc(($unnnic-font-size-body-gt + $unnnic-line-height-md) / 2);

    width: $unnnic-border-width-thinner;
    height: v-bind('progressHeight + "px"');

    background-color: $unnnic-color-neutral-cleanest;

    transition: height 0.6s ease;

    &--right {
      right: 0;
    }
  }
}
</style>
