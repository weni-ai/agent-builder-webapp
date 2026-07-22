/**
 * Fetches conversations from the v2 endpoint, including date formatting and pagination.
 */

import { endOfDay, startOfDay } from 'date-fns';

import nexusRequest from '@/api/nexusaiRequest';
import { ConversationAdapter } from './conversation';

const ENDPOINT_PATH = (projectUuid) => `/api/v2/${projectUuid}/conversations`;

/**
 * Converts date (dd-mm-yyyy) to ISO UTC (Z), representing start/end of day
 * in user timezone.
 * @param {string} dateStr - Date in format dd-mm-yyyy
 * @param {boolean} [isEndOfDay=false]
 * @returns {string}
 */
function formatDateWithTimezone(dateStr, isEndOfDay = false) {
  if (!dateStr) return dateStr;

  const [day, month, year] = dateStr.split('-').map(Number);
  if (!day || !month || !year) return dateStr;

  const date = new Date(year, month - 1, day);
  const targetDate = isEndOfDay ? endOfDay(date) : startOfDay(date);

  return targetDate.toISOString();
}

/**
 * Converts params to the expected format for the v2 endpoint
 * (start_date/end_date in ISO with user timezone)
 * @param {Object} params - { start_date?, end_date?, ... }
 * @returns {Object}
 */
function buildEndpointParams(params) {
  const { start_date, end_date, ...rest } = params;

  return {
    ...rest,
    ...(start_date && {
      start_date: formatDateWithTimezone(start_date, false),
    }),
    ...(end_date && {
      end_date: formatDateWithTimezone(end_date, true),
    }),
  };
}

/**
 * Checks if there are more pages to load.
 * @param {Object} data - { next? }
 * @param {string} status - loading status
 * @returns {boolean}
 */
export function hasMoreToLoad(data, status) {
  const hasNext = !!data?.next;
  const isLoading = status === 'loading';
  const hasError = status === 'error';

  return hasNext && !isLoading && !hasError;
}

/**
 * Returns the next-page URL for load more, when available.
 * @param {number} page
 * @param {Object} data - { next? }
 * @returns {{ next: string } | null}
 */
export function getPaginationPayload(page, data) {
  if (page <= 1 || !data?.next) return null;

  return { next: data.next };
}

/**
 * Extracts the path from the next URL for use with the client HTTP baseUrl
 * @param {string} nextUrl - Full URL or path
 * @returns {string | null}
 */
export function extractPathFromNextUrl(nextUrl) {
  if (!nextUrl) return null;
  return nextUrl.includes('/api')
    ? nextUrl.slice(nextUrl.indexOf('/api'))
    : nextUrl;
}

/**
 * Lists conversations from the v2 endpoint.
 * @param {Object} filterData - { projectUuid, signal, hideGenericErrorAlert?, filters?, pagination? }
 * @returns {Promise<Object>}
 */
export async function fetchConversationList(filterData) {
  const {
    projectUuid,
    signal,
    hideGenericErrorAlert = false,
    filters = {},
    pagination = null,
  } = filterData;

  const config = { signal, hideGenericErrorAlert };

  if (pagination?.next) {
    const path = extractPathFromNextUrl(pagination.next);
    if (!path) return { results: [], next: null };

    const { data } = await nexusRequest.$http.get(path, config);
    return ConversationAdapter.fromApi(data) || { results: [], next: null };
  }

  const params = buildEndpointParams(ConversationAdapter.toApi({ ...filters }));
  const { data } = await nexusRequest.$http.get(
    `${ENDPOINT_PATH(projectUuid)}?${new URLSearchParams(params)}`,
    config,
  );

  return ConversationAdapter.fromApi(data) || { results: [], next: null };
}
