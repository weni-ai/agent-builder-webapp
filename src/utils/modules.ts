import { moduleSessionStorage } from "./storage";

/**
 * Module Types for Agent Builder
 * Each module has isolated routes
 */
export type AgentBuilderModule = 'conversations' | 'agents' | 'build';

export const AGENT_BUILDER_MODULES: Record<AgentBuilderModule, string> = {
  conversations: 'conversations',
  agents: 'agents',
  build: 'build',
};

/**
 * Gets the current agent builder module
 */
export function getCurrentModule(): AgentBuilderModule {
  const urlParams = new URLSearchParams(window.location.search);
  const moduleParam = urlParams.get('module') as AgentBuilderModule;

  if (moduleParam && AGENT_BUILDER_MODULES[moduleParam]) {
    return moduleParam;
  }

  const storedModule = moduleSessionStorage.getItem('moduleName') as AgentBuilderModule;
  if (storedModule && AGENT_BUILDER_MODULES[storedModule]) {
    return storedModule;
  }

  return 'build';
}

/**
 * Sets the agent builder module (useful for programmatic module switching)
 */
export function setModule(module: AgentBuilderModule): void {
  if (!AGENT_BUILDER_MODULES[module]) {
    console.error(`[AgentBuilder] Invalid module: ${module}`);
    return;
  }

  moduleSessionStorage.setItem('moduleName', module);
}

