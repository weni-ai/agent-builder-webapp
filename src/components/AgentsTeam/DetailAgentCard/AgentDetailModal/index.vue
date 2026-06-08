<template>
  <UnnnicDialog
    class="agent-detail-modal"
    data-testid="agent-detail-dialog"
    :open="open"
    lazyMount
    @update:open="$emit('update:open', $event)"
  >
    <UnnnicDialogContent
      data-testid="agent-detail-content"
      size="large"
    >
      <AgentModalHeader
        data-testid="agent-detail-header"
        :agent="agent"
      />

      <section class="agent-detail-modal__details">
        <section class="agent-detail-modal__details-content">
          <section class="agent-detail-modal__summary">
            <AgentDetailSection
              :title="$t('agents.assigned_agents.agent_details.about')"
              :description="aboutDescription"
              :lastUpdated="lastUpdatedLabel"
              data-testid="agent-detail-about-section"
            />

            <SystemSection
              v-if="assignedSystemSlug"
              :system="assignedSystemSlug"
            />
          </section>

          <McpSection
            v-if="assignedMCP"
            :mcp="assignedMCP"
          />
        </section>

        <ViewOptions
          data-testid="agent-detail-view-options"
          :agent="agent"
          @agent-removed="handleAgentRemoved"
        />
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { Agent } from '@/store/types/Agents.types';
import useTranslatedField from '@/composables/useTranslatedField';
import { formatLongDate, formatTime } from '@/utils/formatters';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import McpSection from './McpSection.vue';
import SystemSection from './SystemSection.vue';
import AgentDetailSection from './AgentDetailSection.vue';
import ViewOptions from './ViewOptions.vue';

const props = defineProps<{
  agent: Agent;
}>();

const { t } = useI18n();

const translateField = useTranslatedField();

const aboutDescription = computed(() => translateField(props.agent.about));

const lastUpdatedLabel = computed(() => {
  if (!props.agent.last_updated) return undefined;

  return t('agents.assigned_agents.agent_details.last_updated', {
    date: formatLongDate(props.agent.last_updated),
    time: formatTime(props.agent.last_updated),
  });
});

const assignedMCP = computed(
  () => props.agent.mcps?.filter((mcp) => mcp.name)?.[0] ?? null,
);

const assignedSystemSlug = computed(() => assignedMCP.value?.system ?? null);

const emit = defineEmits(['update:open']);

defineModel('open', {
  type: Boolean,
  required: true,
});

function handleAgentRemoved() {
  emit('update:open', false);
}
</script>

<style lang="scss" scoped>
.agent-detail-modal {
  &__details {
    padding: $unnnic-space-6;

    overflow: hidden;

    &,
    &-content {
      display: flex;
      flex-direction: column;
      gap: $unnnic-space-4;
    }

    &-content {
      overflow: auto;
    }
  }

  &__summary {
    display: flex;
    gap: $unnnic-space-4;

    > * {
      max-width: 50%;
    }

    > *:only-child {
      max-width: 100%;
    }
  }
}
</style>
