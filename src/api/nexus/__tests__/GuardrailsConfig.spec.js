import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GuardrailsConfig } from '@/api/nexus/GuardrailsConfig';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      patch: vi.fn(),
    },
  },
}));

const apiConfig = {
  categories: [
    {
      slug: 'politics',
      name: 'Politics',
      description: 'Political topics',
      blocked: true,
    },
  ],
  blocking_message: 'Blocked message',
  writable: true,
};

describe('GuardrailsConfig API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests and normalizes the guardrails config', async () => {
    request.$http.get.mockResolvedValue({ data: apiConfig });

    const result = await GuardrailsConfig.read({
      projectUuid: 'project-uuid',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/guardrails-config/',
    );
    expect(result).toEqual({
      topics: [{ id: 'politics', enabled: true }],
      blockingMessage: 'Blocked message',
      writable: true,
    });
  });

  it('patches with a snake_case payload and returns normalized config', async () => {
    request.$http.patch.mockResolvedValue({ data: apiConfig });

    const result = await GuardrailsConfig.update({
      projectUuid: 'project-uuid',
      data: {
        categoryStates: { politics: false },
        blockingMessage: 'Updated message',
      },
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project-uuid/guardrails-config/',
      {
        category_states: { politics: false },
        blocking_message: 'Updated message',
      },
      { hideGenericErrorAlert: true },
    );
    expect(result.topics).toEqual([{ id: 'politics', enabled: true }]);
  });
});
