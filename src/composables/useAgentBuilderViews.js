import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

export default function useAgentBuilderViews() {
  const t = (value) => i18n.global.t(value);

  return computed(() => [
    {
      title: t('agent_builder.tabs.instructions.title'),
      description: t('agent_builder.tabs.instructions.description'),
      page: 'instructions',
      icon: 'format_list_bulleted',
    },
    {
      title: t('agent_builder.tabs.knowledge.title'),
      description: t('agent_builder.tabs.knowledge.description'),
      page: 'knowledge',
      icon: 'article',
    },
    {
      title: t('agent_builder.tabs.tunings.title'),
      description: t('agent_builder.tabs.tunings.description'),
      page: 'tunings',
      icon: 'settings',
    },
  ]);
}
