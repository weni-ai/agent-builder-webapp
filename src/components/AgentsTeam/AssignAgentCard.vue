<template>
  <section
    data-testid="assign-agent-card"
    class="assign-agent-card"
  >
    <AssignAgentCardSkeleton
      v-if="loading"
      data-testid="assign-agent-card-skeleton"
    />

    <section
      v-else
      class="assign-agent-card__content"
    >
      <AgentIcon
        v-if="agent.icon"
        :icon="agent.icon"
        class="content__icon"
        data-testid="agent-icon"
      />

      <header class="content__header">
        <UnnnicIntelligenceText
          tag="p"
          family="secondary"
          size="body-gt"
          color="neutral-darkest"
          weight="bold"
          data-testid="title"
        >
          {{ agent.name }}
        </UnnnicIntelligenceText>

        <section
          v-if="
            (assignment && !agent.assigned && !agent.is_official) || !assignment
          "
          class="header__actions"
          data-testid="assign-agent-card-actions"
        >
          <UnnnicTag
            v-if="isAgentInTeam()"
            type="next"
            :text="
              agent.is_official
                ? $t('router.agents_team.card.official')
                : $t('router.agents_team.card.custom')
            "
            :scheme="agent.is_official ? 'weni' : 'aux-purple'"
            data-testid="agent-tag"
          />

          <UnnnicIconLoading
            v-if="isToggleAgentAssignmentLoading"
            size="avatar-nano"
            class="actions__content"
            data-testid="loading-icon"
          />
          <!-- v-show used instead of v-else to prevent ContentItemActions popover rendering error -->
          <section
            v-show="!isToggleAgentAssignmentLoading"
            class="actions__content"
            data-testid="content-item-actions-content"
          >
            <ContentItemActions
              :actions="assignAgentHeaderActions"
              minWidth="auto"
              data-testid="content-item-actions"
            />
          </section>
        </section>

        <UnnnicIntelligenceText
          v-if="agent.description"
          class="header__description"
          tag="p"
          family="secondary"
          size="body-gt"
          color="neutral-cloudy"
          :title="agent.description"
          data-testid="description"
        >
          {{ agent.description }}
        </UnnnicIntelligenceText>
      </header>

      <section class="content__skills">
        <Skill
          v-for="skill in agent.skills"
          :key="skill.name"
          :title="skill.name"
          :icon="skill.icon"
          data-testid="skill"
        />
      </section>
    </section>

    <UnnnicButton
      v-if="!loading && assignment"
      :class="[
        'assign-agent-card__button',
        { 'assign-agent-card__button--assigned': agent.assigned },
      ]"
      :text="
        agent.assigned
          ? $t('router.agents_team.card.assigned')
          : $t('router.agents_team.card.assign')
      "
      :type="agent.assigned ? 'secondary' : 'primary'"
      :iconLeft="agent.assigned ? 'check' : ''"
      size="small"
      :loading="isAssigning"
      data-testid="assign-button"
      @click="
        !agent.assigned && agent.credentials?.length > 0
          ? toggleDrawer()
          : toggleAgentAssignment()
      "
    />
  </section>

  <AssignAgentDrawer
    v-model="isAssignDrawerOpen"
    :agent="agent"
    :isAssigning="isDrawerAssigning"
    @assign="toggleDrawerAssigning"
  />

  <DeleteAgentModal
    v-model="isDeleteAgentModalOpen"
    :agent="agent"
  />
</template>

<script setup>
import { computed, ref } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';

import i18n from '@/utils/plugins/i18n';

import AssignAgentCardSkeleton from './AssignAgentCardSkeleton.vue';
import AssignAgentDrawer from './AssignAgentDrawer.vue';
import ContentItemActions from '@/components/ContentItemActions.vue';
import Skill from './Skill.vue';
import AgentIcon from './AgentIcon.vue';
import DeleteAgentModal from './DeleteAgentModal.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  agent: {
    type: Object,
    default: () => ({}),
  },
  assignment: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['agent-assigned']);

const agentsTeamStore = useAgentsTeamStore();

const isAssignDrawerOpen = ref(false);
const isAssigning = ref(false);
const isDrawerAssigning = ref(false);
const isToggleAgentAssignmentLoading = ref(false);
const isDeleteAgentModalOpen = ref(false);

const tuningsStore = useTuningsStore();

const assignAgentHeaderActions = computed(() => [
  {
    scheme: 'aux-red-500',
    icon: 'delete',
    text: i18n.global.t('router.agents_team.card.remove_agent'),
    onClick: handleRemoveAgent,
  },
]);

function isAgentInTeam() {
  return agentsTeamStore.activeTeam.data.agents.some(
    (agent) => agent.uuid === props.agent.uuid,
  );
}

async function toggleDrawer() {
  isAssignDrawerOpen.value = !isAssignDrawerOpen.value;
}

async function assignAgent() {
  const isAssigned = props.assignment ? !props.agent.assigned : false;
  try {
    isToggleAgentAssignmentLoading.value = true;

    const { status } = await agentsTeamStore.toggleAgentAssignment({
      uuid: props.agent.uuid,
      is_assigned: isAssigned,
    });

    if (status === 'success') {
      if (isAssigned) emit('agent-assigned');
      if (props.agent.credentials?.length || !props.assignment)
        await tuningsStore.fetchCredentials();
    }
  } catch (error) {
    console.error(error);
  } finally {
    isToggleAgentAssignmentLoading.value = false;
  }
}

async function handleRemoveAgent() {
  if (isAgentInTeam()) {
    toggleAgentAssignment();
  } else {
    toggleDeleteAgentModal();
  }
}

async function toggleDeleteAgentModal() {
  isDeleteAgentModalOpen.value = !isDeleteAgentModalOpen.value;
}

async function toggleAgentAssignment() {
  isAssigning.value = true;
  await assignAgent();
  isAssigning.value = false;
}

async function toggleDrawerAssigning() {
  isDrawerAssigning.value = true;
  await assignAgent();
  isDrawerAssigning.value = false;
  toggleDrawer();
}
</script>

<style lang="scss" scoped>
.assign-agent-card {
  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;

  padding: $unnnic-spacing-sm;

  display: grid;
  gap: $unnnic-spacing-ant;
  align-content: space-between;

  &__content {
    display: grid;
    grid-template-columns: auto repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: $unnnic-spacing-ant;

    .content__icon {
      width: $unnnic-icon-size-xl;
      height: auto;
      aspect-ratio: 1/1;

      grid-column: 1 / 2;
      grid-row: 1 / 2;
      align-self: center;
    }

    .content__header {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: $unnnic-spacing-xs;
      align-content: center;

      grid-column: 2 / 5;
      grid-row: 1 / 2;

      .header__actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        grid-column: 2 / 3;
        grid-row: 1 / 2;

        .actions__content {
          display: flex;
          margin-left: auto;
        }
      }

      .header__description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;

        grid-column: 1 / 3;
        grid-row: 2 / 3;
      }
    }

    .content__skills {
      display: flex;
      gap: $unnnic-spacing-nano;
      flex-wrap: wrap;

      grid-column: 1 / 5;
      grid-row: 2 / 3;
    }
  }

  :deep(.unnnic-button).assign-agent-card__button {
    &--assigned {
      color: $unnnic-color-weni-600;
    }

    [class*='icon'] {
      color: $unnnic-color-weni-600;
    }
  }
}
</style>
