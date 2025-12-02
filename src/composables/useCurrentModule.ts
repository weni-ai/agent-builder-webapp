import { computed } from 'vue';
import { useRoute } from 'vue-router';

export type AgentBuilderModule = 'conversations' | 'agents' | 'build';

export const MODULE_PATHS: Record<AgentBuilderModule, string> = {
  conversations: '/conversations',
  agents: '/agents',
  build: '/build',
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

  return {
    currentModule,
    isModule,
    isBuildModule,
    isConversationsModule,
    isAgentsModule,
    MODULE_PATHS,
  };
};
