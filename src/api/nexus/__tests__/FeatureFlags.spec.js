import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeatureFlags } from '@/api/nexus/FeatureFlags';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'store-project-uuid' }),
}));

describe('FeatureFlags API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the feature flags with the provided project uuid', () => {
    FeatureFlags.read({ projectUuid: 'custom-uuid' });

    expect(request.$http.get).toHaveBeenCalledWith('api/feature_flags/', {
      params: { project_uuid: 'custom-uuid' },
    });
  });

  it('falls back to the project store uuid when none is provided', () => {
    FeatureFlags.read();

    expect(request.$http.get).toHaveBeenCalledWith('api/feature_flags/', {
      params: { project_uuid: 'store-project-uuid' },
    });
  });
});
