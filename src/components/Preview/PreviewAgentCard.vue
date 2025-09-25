<template>
  <section
    data-testid="preview-agent-card"
    class="preview-agent-card"
    :class="{
      'preview-agent-card--active': active,
      'preview-agent-card--standby': !active,
      'preview-agent-card--animated': active && type === 'agent',
    }"
  >
    <Transition name="fade">
      <VueParticles
        v-show="active && currentTask"
        :id="`particles-${name}`"
        class="preview-agent-card__particles"
        :direction="bubbleDirection"
      />
    </Transition>

    <AgentIcon
      v-if="type === 'manager'"
      icon="Manager"
      class="preview-agent-card__agent-icon"
      :data-testid="`preview-agent-card-icon-${type}`"
    />

    <Transition
      v-else
      name="fade"
    >
      <AgentIcon
        v-show="type === 'agent' && active"
        :icon="icon"
        class="preview-agent-card__agent-icon"
        :data-testid="`preview-agent-card-icon-${type}`"
      />
    </Transition>

    <section
      class="preview-agent-card__content"
      :class="{
        'preview-agent-card__content--active': type === 'agent' && active,
      }"
    >
      <UnnnicIntelligenceText
        data-testid="preview-agent-card-name"
        tag="h3"
        family="secondary"
        class="preview-agent-card__title"
        size="body-gt"
        color="neutral-darkest"
        weight="bold"
      >
        {{ name }}
      </UnnnicIntelligenceText>
      <UnnnicIntelligenceText
        data-testid="preview-agent-card-status"
        tag="p"
        family="secondary"
        class="preview-agent-card__status"
        :class="{
          'preview-agent-card__status--active': active,
        }"
        size="body-md"
        color="weni-600"
      >
        {{ currentTask }}
      </UnnnicIntelligenceText>
    </section>
  </section>
</template>

<script setup>
import VueParticles from './Particles.vue';
import AgentIcon from '../AgentsTeam/AgentIcon.vue';

defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['manager', 'agent'].includes(value),
  },
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  currentTask: {
    type: String,
    required: true,
  },
  bubbleDirection: {
    type: String,
    default: 'none',
    validator: (value) => ['left', 'right', 'bounce', 'none'].includes(value),
  },
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.preview-agent-card {
  position: relative;
  box-shadow: $unnnic-shadow-level-near;
  border-radius: $unnnic-border-radius-md;
  background-color: $unnnic-color-background-white;
  border: $unnnic-border-width-thinner solid transparent;

  padding: $unnnic-spacing-sm;

  display: flex;
  align-items: center;
  gap: $unnnic-spacing-ant;

  height: fit-content;
  min-height: calc(
    ($unnnic-font-size-body-gt + $unnnic-line-height-md) * 2 +
      $unnnic-spacing-sm * 2
  );

  z-index: 1;

  transition: all 0.3s ease;

  transform-origin: center;
  transform-box: fill-box;

  overflow: hidden;

  &__particles {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 150px;
    z-index: -1;
    border-radius: $unnnic-border-radius-md;
  }

  &--animated {
    transform: scale(1.02);
  }

  &--standby {
    box-shadow: none;
    border-color: $unnnic-color-neutral-soft;

    .preview-agent-card__title {
      color: $unnnic-color-neutral-cleanest;
    }

    .preview-agent-card__status {
      color: $unnnic-color-neutral-cleanest;
    }
  }

  &__agent-icon {
    width: $unnnic-icon-size-lg;
    height: $unnnic-icon-size-lg;
  }

  &__content {
    overflow: hidden;
    transition: all 0.4s ease;

    &--active {
      animation: slideInFromLeft 0.4s ease forwards;
    }
  }

  .preview-agent-card__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
