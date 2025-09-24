import { createHttpClient } from './httpClientFactory';

export default {
  get $http() {
    return createHttpClient('NEXUS_API_BASE_URL');
  },
};
