<template>
  <section class="manager-selector">
    <UnnnicDisclaimer
      v-if="shouldShowPostUpgradeDisclaimer"
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
        )
      "
      data-testid="manager-upgrade-banner-success"
    />

    <UnnnicDisclaimer
      v-else-if="shouldShowUpgradeDisclaimer"
      type="attention"
      :title="
        $t(
          'agent_builder.tunings.manager.upgrade_banner.disclaimer_title_with_date',
          {
            manager_name: managers.new.label,
            date: formattedLegacyDeprecation,
          },
        )
      "
      :description="
        $t(
          'agent_builder.tunings.manager.upgrade_banner.manager_2_dot_6_disclaimer_description',
        )
      "
      data-testid="manager-upgrade-banner"
    />

    <ManagerUpgradeCard
      v-else-if="shouldUpgradeManager"
      data-testid="manager-upgrade-card"
    />

    <h2
      class="manager-selector__title"
      data-testid="manager-selector-title"
    >
      {{ $t('agent_builder.tunings.manager.title') }}
    </h2>
    <UnnnicRadioGroup
      state="vertical"
      :modelValue="selectedManager"
      data-testid="manager-selector-radio-group"
      @update:model-value="updateSelectedManager"
    >
      <section class="manager-selector__new-manager">
        <UnnnicRadio
          data-testid="manager-selector-radio-new"
          :label="managers.new.label"
          :value="managers.new.id"
          :helper="$t('agent_builder.tunings.manager.recommended')"
        />

        <p
          class="manager-selector__new-tag"
          data-testid="manager-selector-radio-new-tag"
        >
          {{ $t('agent_builder.tunings.manager.new') }}
        </p>
      </section>

      <UnnnicRadio
        data-testid="manager-selector-radio-legacy"
        :label="managers.legacy.label"
        :value="managers.legacy.id"
        :helper="$t('agent_builder.tunings.manager.legacy_model')"
      />
    </UnnnicRadioGroup>
  </section>
</template>

<script setup>
import { computed, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import ManagerUpgradeCard from './ManagerUpgradeCard.vue';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { format } from 'date-fns';
import { enUS, es as esLocale, ptBR } from 'date-fns/locale';
import i18n from '@/utils/plugins/i18n';

const managerSelectorStore = useManagerSelectorStore();
const { resetPostUpgradeDisclaimerSession } = managerSelectorStore;
const {
  options,
  selectedManager,
  shouldUpgradeManager,
  shouldShowUpgradeDisclaimer,
  shouldShowPostUpgradeDisclaimer,
  legacyDeprecationDate,
} = storeToRefs(managerSelectorStore);

const localeFormats = {
  en: { locale: enUS, pattern: 'MMMM d, yyyy' },
  es: { locale: esLocale, pattern: "d 'de' MMMM 'de' yyyy" },
  'pt-br': { locale: ptBR, pattern: "d 'de' MMMM 'de' yyyy" },
};

const managers = computed(() => options.value?.managers);
const formattedLegacyDeprecation = computed(() => {
  if (!legacyDeprecationDate.value) {
    return '';
  }

  const normalizedLocale = i18n.global.locale?.toLowerCase() || 'en';
  const localeConfig = localeFormats[normalizedLocale] || localeFormats.en;

  return format(legacyDeprecationDate.value, localeConfig.pattern, {
    locale: localeConfig.locale,
  });
});

const updateSelectedManager = (managerId) => {
  managerSelectorStore.setSelectedManager(managerId);
};

onUnmounted(() => {
  resetPostUpgradeDisclaimerSession();
});
</script>

<style lang="scss" scoped>
.manager-selector {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-neutral-darkest;
  }

  &__new-manager {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-2;
  }

  &__new-tag {
    border-radius: $unnnic-radius-1;

    padding: $unnnic-space-05 $unnnic-space-1;

    background-color: $unnnic-color-teal-100;
    color: $unnnic-color-fg-active;
    font: $unnnic-font-caption-1;
  }
}
</style>
