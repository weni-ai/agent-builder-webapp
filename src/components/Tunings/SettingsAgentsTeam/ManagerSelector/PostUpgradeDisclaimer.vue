<template>
  <UnnnicDisclaimer
    type="success"
    :title="
      $t(
        'agent_builder.tunings.manager.upgrade_banner.auto_upgrade_success_title',
        {
          manager_name: managers.new.label,
        },
      )
    "
    :description="
      $t(
        'agent_builder.tunings.manager.upgrade_banner.auto_upgrade_success_description',
        {
          manager_name: managers.new.label,
        },
      )
    "
    data-testid="post-upgrade-disclaimer"
  />
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useManagerSelectorStore } from '@/store/ManagerSelector';

const managerSelectorStore = useManagerSelectorStore();
const { options } = storeToRefs(managerSelectorStore);

const managers = computed(() => options.value.managers);
</script>
