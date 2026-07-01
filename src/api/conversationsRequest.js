import { createHttpClient } from './httpClientFactory';

export default {
  get $http() {
    return createHttpClient('CONVERSATIONS_API_BASE_URL');
  },
};
