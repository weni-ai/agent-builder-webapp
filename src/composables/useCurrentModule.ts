import { computed } from 'vue';
import { useRoute } from 'vue-router';

export type AgentBuilderModule =
  | 'conversations'
  | 'agents'
  | 'build'
  | 'knowledge';

export const MODULE_PATHS: Record<AgentBuilderModule, string> = {
  conversations: '/conversations',
  agents: '/agents',
  build: '/build',
  knowledge: '/knowledge',
} as const;

export const getCurrentModuleFromPath = (
  path: string,
): AgentBuilderModule | null => {
  if (!path || path === '/') {
    return null;
  }

  if (path.startsWith(MODULE_PATHS.conversations)) {
    return 'conversations';
  }

  if (path.startsWith(MODULE_PATHS.agents)) {
    return 'agents';
  }

  if (path.startsWith(MODULE_PATHS.build)) {
    return 'build';
  }

  if (path.startsWith(MODULE_PATHS.knowledge)) {
    return 'knowledge';
  }

  return null;
};

export const useCurrentModule = () => {
  const route = useRoute();

  const currentModule = computed<AgentBuilderModule | null>(() =>
    getCurrentModuleFromPath(route.path),
  );

  const isModule = (module: AgentBuilderModule): boolean =>
    currentModule.value === module;

  const isBuildModule = computed(() => isModule('build'));
  const isConversationsModule = computed(() => isModule('conversations'));
  const isAgentsModule = computed(() => isModule('agents'));
  const isKnowledgeModule = computed(() => isModule('knowledge'));

  return {
    currentModule,
    isModule,
    isBuildModule,
    isConversationsModule,
    isAgentsModule,
    isKnowledgeModule,
    MODULE_PATHS,
  };
};
