import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import nexusaiRequest from '@/api/nexusaiRequest';
import { createHttpClient } from '@/api/httpClientFactory';
import env from '@/utils/env';
import { createTestingPinia } from '@pinia/testing';
import { useUserStore } from '@/store/User';

vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue({
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    }),
  },
}));

vi.mock('@sentry/browser', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/store/Alert', () => ({
  useAlertStore: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

createTestingPinia({
  initialState: {
    User: {
      user: {
        token: '',
      },
    },
  },
});

describe('nexusaiRequest.js', () => {
  let userStore;
  beforeEach(() => {
    vi.clearAllMocks();
    userStore = useUserStore();
  });

  it('should create axios client with correct baseURL and headers', () => {
    userStore.user.token = 'token123';

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    nexusaiRequest.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: env('NEXUS_API_BASE_URL'),
      headers: {
        Authorization: 'token123',
      },
    });
  });

  it('should not include Authorization header when not authenticated', () => {
    userStore.user.token = '';

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    nexusaiRequest.$http;

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: env('NEXUS_API_BASE_URL'),
      headers: {},
    });
  });

  it('should set up response interceptor', () => {
    const mockResponseInterceptor = vi.fn();
    const mockAxiosInstance = {
      interceptors: {
        response: {
          use: mockResponseInterceptor,
        },
      },
    };
    axios.create.mockReturnValue(mockAxiosInstance);

    createHttpClient('NEXUS_API_BASE_URL');

    expect(mockResponseInterceptor).toHaveBeenCalled();
    expect(mockResponseInterceptor).toHaveBeenCalledWith(
      expect.any(Function), // success handler
      expect.any(Function), // error handler
    );
  });
});
