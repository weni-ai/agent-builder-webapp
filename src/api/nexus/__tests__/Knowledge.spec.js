import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Knowledge } from '@/api/nexus/Knowledge';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/api/utils/forceHttps', () => ({
  default: vi.fn((url) => `https-forced::${url}`),
}));

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(() => 'project-uuid'),
  },
}));

describe('Knowledge API — texts.list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the project-scoped endpoint when no cursor is provided', async () => {
    const mockResponse = { data: { results: [], next: null } };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await Knowledge.texts.list();

    expect(request.$http.get).toHaveBeenCalledTimes(1);
    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/inline-content-base-text/',
    );
    expect(result).toEqual(mockResponse);
  });

  it('requests the project-scoped endpoint when called with an empty object', async () => {
    const mockResponse = { data: { results: [], next: null } };
    request.$http.get.mockResolvedValue(mockResponse);

    await Knowledge.texts.list({});

    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/inline-content-base-text/',
    );
  });

  it('uses the cursor URL (forced to https) when a next cursor is provided', async () => {
    const mockResponse = { data: { results: [], next: null } };
    request.$http.get.mockResolvedValue(mockResponse);

    await Knowledge.texts.list({
      next: 'http://nexus.example.com/page-2/',
    });

    expect(request.$http.get).toHaveBeenCalledWith(
      'https-forced::http://nexus.example.com/page-2/',
    );
  });
});

describe('Knowledge API — texts.read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the project-scoped item endpoint with the given uuid', async () => {
    const mockResponse = {
      data: {
        uuid: 'text-uuid-1',
        title: 'My text',
        text: 'Body',
        last_updated_at: '2024-01-01T00:00:00Z',
      },
    };
    request.$http.get.mockResolvedValue(mockResponse);

    const result = await Knowledge.texts.read({ uuid: 'text-uuid-1' });

    expect(request.$http.get).toHaveBeenCalledTimes(1);
    expect(request.$http.get).toHaveBeenCalledWith(
      'api/project-uuid/inline-content-base-text/text-uuid-1/',
    );
    expect(result).toEqual(mockResponse);
  });
});
