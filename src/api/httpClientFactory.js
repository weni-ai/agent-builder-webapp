import axios from 'axios';
import { get } from 'lodash';
import * as Sentry from '@sentry/browser';
import i18n from '../utils/plugins/i18n';

import env from '@/utils/env';

import { useAlertStore } from '@/store/Alert';
import { useUserStore } from '@/store/User';

/**
 * Creates a configured axios instance with shared interceptors and error handling
 * @param {string} baseUrlKey - The runtime variable key for the base URL
 * @returns {Object} - Configured axios instance
 */
export const createHttpClient = (baseUrlKey) => {
  const alertStore = useAlertStore();
  const userStore = useUserStore();

  const client = axios.create({
    baseURL: env(baseUrlKey),
    headers: {
      ...(userStore.user.token
        ? { Authorization: `${userStore.user.token}` }
        : {}),
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      Sentry.captureException(err);

      if (get(err, 'config.hideGenericErrorAlert')) {
        throw err;
      }

      const statusCode = get(err, 'response.status');
      let defaultMessage;

      if ([500, 408].includes(statusCode)) {
        defaultMessage = i18n.global.t('internal_server_error');
      } else if (statusCode === 401) {
        defaultMessage = i18n.global.t('unauthorized');
      } else {
        defaultMessage = i18n.global.t('unexpected_error');
      }

      alertStore.add({
        text: get(err, 'response.data.detail') || defaultMessage,
        type: 'error',
      });

      throw err;
    },
  );

  return client;
};
