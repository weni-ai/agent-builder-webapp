import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import nexusaiAPI from '@/api/nexusaiAPI';
import env from '@/utils/env';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: '1234' }),
}));

vi.mock('@/utils/env', () => ({
  default: vi.fn(),
}));

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    feature_flags: {
      read: vi.fn(),
    },
  },
}));

describe('FeatureFlags store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useFeatureFlagsStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts with empty active features and not loading', () => {
    expect(store.activeFeatures).toEqual([]);
    expect(store.featureFlagsLoaded).toBe(false);
  });

  describe('getFeatureFlags', () => {
    it('calls the API with the current project uuid', async () => {
      nexusaiAPI.feature_flags.read.mockResolvedValue({
        data: { active_features: [] },
      });

      await store.getFeatureFlags();

      expect(nexusaiAPI.feature_flags.read).toHaveBeenCalledWith({
        projectUuid: '1234',
      });
    });

    it('fills activeFeatures on success', async () => {
      nexusaiAPI.feature_flags.read.mockResolvedValue({
        data: { active_features: ['categorization_of_instructions'] },
      });

      await store.getFeatureFlags();

      expect(store.activeFeatures).toEqual(['categorization_of_instructions']);
      expect(store.featureFlagsLoaded).toBe(true);
    });

    it('defaults to an empty array when active_features is missing', async () => {
      nexusaiAPI.feature_flags.read.mockResolvedValue({ data: {} });

      await store.getFeatureFlags();

      expect(store.activeFeatures).toEqual([]);
    });

    it('resets activeFeatures to an empty array on error', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      store.activeFeatures = ['stale_flag'];
      nexusaiAPI.feature_flags.read.mockRejectedValue(new Error('failed'));

      await store.getFeatureFlags();

      expect(store.activeFeatures).toEqual([]);
      expect(store.featureFlagsLoaded).toBe(false);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('isFeatureFlagEnabled', () => {
    it('returns true when the flag is active', async () => {
      nexusaiAPI.feature_flags.read.mockResolvedValue({
        data: { active_features: ['settings_agent_voice'] },
      });

      await store.getFeatureFlags();

      expect(store.isFeatureFlagEnabled('settings_agent_voice')).toBe(true);
    });

    it('returns false when the flag is not active', () => {
      expect(store.isFeatureFlagEnabled('settings_agent_voice')).toBe(false);
    });
  });

  describe('flags', () => {
    it('reflects settingsAgentVoice from active features', async () => {
      nexusaiAPI.feature_flags.read.mockResolvedValue({
        data: { active_features: ['settings_agent_voice'] },
      });

      await store.getFeatureFlags();

      expect(store.flags.settingsAgentVoice).toBe(true);
    });

    it('resolves supervisorExport from the env allowlist', () => {
      env.mockReturnValue('1234,5678');

      expect(store.flags.supervisorExport).toBe(true);
    });
  });
});
