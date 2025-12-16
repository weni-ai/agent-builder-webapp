<template>
  <section class="modal-assign-agent__content">
    <ModalAssignAgentRadio
      v-for="system in systems"
      :key="system"
      :selected="system.toLowerCase() === selectedSystem.toLowerCase()"
      @update:selected="selectedSystem = system"
    >
      {{ system }}
    </ModalAssignAgentRadio>
  </section>
</template>

<script setup lang="ts">
import ModalAssignAgentRadio from '../Radio.vue';
import { AgentSystem } from '@/store/types/Agents.types';

defineProps<{
  systems: AgentSystem[];
}>();

const selectedSystem = defineModel<AgentSystem>('selectedSystem', {
  required: true,
});
</script>
