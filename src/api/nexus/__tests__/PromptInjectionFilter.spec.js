import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PromptInjectionFilter } from '@/api/nexus/PromptInjectionFilter';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      patch: vi.fn(),
    },
  },
}));

const apiFilter = {
  enabled: true,
  writable: true,
};

describe('PromptInjectionFilter API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests and normalizes the prompt injection filter', async () => {
    request.$http.get.mockResolvedValue({ data: apiFilter });

    const result = await PromptInjectionFilter.read({
      projectUuid: 'project-uuid',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/prompt-injection-filter/',
    );
    expect(result).toEqual({
      enabled: true,
    });
  });

  it('patches with enabled and returns normalized filter without writable', async () => {
    request.$http.patch.mockResolvedValue({ data: apiFilter });

    const result = await PromptInjectionFilter.update({
      projectUuid: 'project-uuid',
      data: { enabled: false },
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project-uuid/prompt-injection-filter/',
      { enabled: false },
      { hideGenericErrorAlert: true },
    );
    expect(result).toEqual({ enabled: true });
    expect(result).not.toHaveProperty('writable');
  });
});
