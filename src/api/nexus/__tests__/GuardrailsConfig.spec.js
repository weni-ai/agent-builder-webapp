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

describe('GuardrailsConfig API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the guardrails config for the project', () => {
    GuardrailsConfig.read({ projectUuid: 'project-uuid' });

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/guardrails-config/',
    );
  });

  it('patches the guardrails config with the given payload', () => {
    const payload = {
      category_states: { politics: false },
    };

    GuardrailsConfig.update({
      projectUuid: 'project-uuid',
      payload,
    });

    expect(request.$http.patch).toHaveBeenCalledWith(
      'api/project-uuid/guardrails-config/',
      payload,
      { hideGenericErrorAlert: true },
    );
  });
});
