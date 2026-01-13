<template>
  <UnnnicDisclaimer
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
    data-testid="upgrade-disclaimer"
  />
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { format } from 'date-fns';
import { enUS, es as esLocale, ptBR } from 'date-fns/locale';

import { useManagerSelectorStore } from '@/store/ManagerSelector';
import i18n from '@/utils/plugins/i18n';

const managerSelectorStore = useManagerSelectorStore();
const { options, legacyDeprecationDate } = storeToRefs(managerSelectorStore);

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
</script>
