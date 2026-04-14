import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import SettingsAgentsTeam from '../index.vue';
import { useEngineSourceStore } from '@/store/EngineSource';

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: {
      settingsAgentVoice: true,
    },
  }),
}));

describe('SettingsAgentsTeam/index.vue', () => {
  let wrapper;
  let engineSourceStore;
  let pinia;

  const mainContainer = () =>
    wrapper.find('[data-testid="settings-agents-team"]');
  const managerDisclaimers = () =>
    wrapper.findComponent('[data-testid="manager-disclaimers"]');
  const engineSource = () =>
    wrapper.findComponent('[data-testid="engine-source"]');
  const managerSelector = () =>
    wrapper.findComponent('[data-testid="manager-selector"]');
  const customModelConfig = () =>
    wrapper.findComponent('[data-testid="custom-model-config"]');
  const agentsPreview = () =>
    wrapper.findComponent('[data-testid="agents-preview"]');
  const voiceSettings = () =>
    wrapper.findComponent('[data-testid="voice-settings"]');

  const createWrapper = () => {
    pinia = createTestingPinia({ stubActions: false });
    engineSourceStore = useEngineSourceStore();

    wrapper = shallowMount(SettingsAgentsTeam, {
      global: { plugins: [pinia] },
    });
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders ManagerDisclaimers, EngineSource, and AgentsPreview', () => {
    expect(managerDisclaimers().exists()).toBe(true);
    expect(engineSource().exists()).toBe(true);
    expect(agentsPreview().exists()).toBe(true);
  });

  it('renders ManagerSelector when engine type is native', () => {
    expect(managerSelector().exists()).toBe(true);
    expect(customModelConfig().exists()).toBe(false);
  });

  it('renders CustomModelConfig when engine type is custom', async () => {
    engineSourceStore.engineType = 'custom';
    await nextTick();

    expect(customModelConfig().exists()).toBe(true);
    expect(managerSelector().exists()).toBe(false);
  });

  it('renders VoiceSettings when settingsAgentVoice flag is true', () => {
    expect(voiceSettings().exists()).toBe(true);
  });

  it('renders components in correct order', () => {
    const children = Array.from(mainContainer().element.children);

    expect(children[0].getAttribute('data-testid')).toBe('manager-disclaimers');
    expect(children[1].getAttribute('data-testid')).toBe('engine-source');
    expect(children[2].getAttribute('data-testid')).toBe('manager-selector');
    expect(children[3].getAttribute('data-testid')).toBe('agents-preview');
    expect(children[4].getAttribute('data-testid')).toBe('voice-settings');
  });
});
