import { createHttpClient } from './httpClientFactory';

export default {
  get $http() {
    return createHttpClient('BILLING_API_BASE_URL');
  },
};
