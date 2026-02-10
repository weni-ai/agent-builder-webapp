/**
 * Centralizes logic for "new" (v2) and "legacy" conversation endpoints.
 * Since 06/02/2026, conversations come from the v2 endpoint; before that, from the legacy endpoint.
 * When the range crosses the date, both are used with independent pagination.
 */

import nexusRequest from '@/api/nexusaiRequest';
import { ConversationAdapter } from './conversation';

/** Data from which conversations come from the v2 endpoint (06/02/2026) */
export const CONVERSATIONS_SWITCH_DATE = new Date(Date.UTC(2026, 1, 6));

export const LEGACY_SOURCE = 'legacy';
export const NEW_SOURCE = 'v2';

/** @typedef {'legacy' | 'new' | 'combined'} ConversationMode */

/**
 * Parses string dd-mm-yyyy to Date UTC
 * @param {string} value - Date in format dd-mm-yyyy
 * @returns {Date | null}
 */
export function parseDateParam(value) {
  if (!value) return null;

  const [day, month, year] = value.split('-').map(Number);

  if (!day || !month || !year) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats Date to string dd-mm-yyyy
 * @param {Date} date
 * @returns {string}
 */
export function formatDateParam(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Determines which search mode to use based on the filter dates
 * @param {Date | null} startDate
 * @param {Date | null} endDate
 * @returns {ConversationMode}
 */
export function getConversationMode(startDate, endDate) {
  if (!startDate || !endDate) return 'legacy';
  if (endDate < CONVERSATIONS_SWITCH_DATE) return 'legacy';
  if (startDate >= CONVERSATIONS_SWITCH_DATE) return 'new';
  return 'combined';
}

/**
 * Adds source to each result for sorting and separator in the UI
 * @param {Object} data - { results, count?, next? }
 * @param {string} source - LEGACY_SOURCE ou NEW_SOURCE
 * @returns {Object}
 */
export function addSourceToResults(data, source) {
  return {
    ...data,
    results: data.results?.map((result) => ({ ...result, source })) || [],
  };
}

/**
 * Sorts results: v2 first, legacy second (to display the correct separator)
 * @param {Array} results
 * @returns {Array}
 */
export function normalizeConversationsBySource(results) {
  const newResults = [];
  const legacyResults = [];

  (results || []).forEach((conversation) => {
    if (conversation?.source === NEW_SOURCE) {
      newResults.push(conversation);
    } else {
      legacyResults.push(conversation);
    }
  });

  return [...newResults, ...legacyResults];
}

/**
 * Checks if there are more pages to load (any endpoint).
 * In combined mode: considers "legacy initial" when new is exhausted and legacy hasn't been loaded yet.
 * @param {Object} data - { next?, newNext?, legacyNext? }
 * @param {string} status - loading status
 * @param {Array} [results] - current results to detect legacy initial in combined mode
 * @returns {boolean}
 */
export function hasMoreToLoad(data, status, results = []) {
  const { next, newNext, legacyNext } = data || {};
  const hasNext = next || newNext || legacyNext;
  const needsLegacyInitial = needsLegacyInitialLoad(data, results);
  const isLoading = status === 'loading';
  const hasError = status === 'error';

  return (!!hasNext || needsLegacyInitial) && !isLoading && !hasError;
}

/**
 * In combined mode: new is exhausted (newNext null) and legacy hasn't been loaded yet
 * @param {Object} data - { newNext?, legacyNext? }
 * @param {Array} results
 * @returns {boolean}
 */
export function needsLegacyInitialLoad(data, results = []) {
  const { newNext, legacyNext } = data || {};
  const hasNewResults = (results || []).some((r) => r?.source === NEW_SOURCE);
  const hasLegacyResults = (results || []).some(
    (r) => r?.source === LEGACY_SOURCE,
  );

  return !newNext && !legacyNext && hasNewResults && !hasLegacyResults;
}

/**
 * Returns pagination payload for load more (only one endpoint at a time).
 * Priority: newNext, then legacyNext, then legacy initial (when new is exhausted).
 * @param {number} page
 * @param {Object} data - { newNext?, legacyNext? }
 * @param {Array} [results] - to detect need for legacy initial
 * @returns {{ pagination?: { source: string, next: string }; onlyLegacy?: true } | null}
 */
export function getPaginationPayload(page, data, results = []) {
  if (page <= 1) return null;

  const { newNext, legacyNext } = data || {};

  if (newNext) {
    return { pagination: { source: NEW_SOURCE, next: newNext } };
  }
  if (legacyNext) {
    return { pagination: { source: LEGACY_SOURCE, next: legacyNext } };
  }
  if (needsLegacyInitialLoad(data, results)) {
    return { onlyLegacy: true };
  }

  return null;
}

/**
 * Key of data to update after pagination response
 * @param {string} paginationSource - NEW_SOURCE or LEGACY_SOURCE
 * @returns {'newNext' | 'legacyNext'}
 */
export function getPaginationKey(paginationSource) {
  return paginationSource === NEW_SOURCE ? 'newNext' : 'legacyNext';
}

/**
 * End date of legacy range (one day before the switch)
 * @returns {Date}
 */
export function getLegacyEndDate() {
  const date = new Date(CONVERSATIONS_SWITCH_DATE);
  date.setUTCDate(date.getUTCDate() - 1);
  return date;
}

/**
 * Extracts the path from the next URL for use with the client HTTP baseUrl
 * @param {string} nextUrl - URL completa ou path
 * @returns {string | null}
 */
export function extractPathFromNextUrl(nextUrl) {
  if (!nextUrl) return null;
  return nextUrl.includes('/api')
    ? nextUrl.slice(nextUrl.indexOf('/api'))
    : nextUrl;
}

/**
 * Checks if the pagination payload is valid for the request
 * @param {{ source?: string; next?: string } | null} pagination
 * @returns {boolean}
 */
export function isValidPaginationPayload(pagination) {
  return Boolean(pagination?.source && pagination?.next);
}

/**
 * Returns the pagination state (next, newNext, legacyNext) from the API response.
 * Used by the store to update conversations.data after each load.
 * @param {Object} responseData - API response (can come from initial load or pagination)
 * @param {Object} currentData - current state { next?, newNext?, legacyNext? }
 * @returns {{ next: string | null; newNext: string | null; legacyNext: string | null } | null}
 */
export function getPaginationStateFromResponse(responseData, currentData = {}) {
  if (
    responseData?.newNext !== undefined ||
    responseData?.legacyNext !== undefined
  ) {
    return {
      next: null,
      newNext: responseData.newNext ?? null,
      legacyNext: responseData.legacyNext ?? null,
    };
  }

  if (responseData?.next !== undefined && !responseData?._paginationSource) {
    return {
      next: responseData.next ?? null,
      newNext: null,
      legacyNext: null,
    };
  }

  if (responseData?._paginationSource) {
    const key = getPaginationKey(responseData._paginationSource);
    return {
      next: null,
      newNext:
        key === 'newNext'
          ? (responseData.next ?? null)
          : (currentData.newNext ?? null),
      legacyNext:
        key === 'legacyNext'
          ? (responseData.next ?? null)
          : (currentData.legacyNext ?? null),
    };
  }

  return null;
}

const LEGACY_ENDPOINT_PATH = (projectUuid) => `/api/${projectUuid}/supervisor/`;
const NEW_ENDPOINT_PATH = (projectUuid) =>
  `/api/v2/${projectUuid}/conversations`;

async function fetchConversations({ url, params, config, source }) {
  const { data } = await nexusRequest.$http.get(
    `${url}?${new URLSearchParams(params)}`,
    config,
  );

  const adaptedData = ConversationAdapter.fromApi(data) || { results: [] };

  return addSourceToResults(adaptedData, source);
}

async function fetchByNextUrl({ nextUrl, config, source }) {
  const path = extractPathFromNextUrl(nextUrl);
  if (!path) return addSourceToResults({ results: [] }, source);

  const { data } = await nexusRequest.$http.get(path, config);

  const adaptedData = ConversationAdapter.fromApi(data) || { results: [] };

  return addSourceToResults(adaptedData, source);
}

/**
 * Executes the list of conversations (legacy, new or combined).
 * Centralizes all endpoint and pagination logic.
 * @param {Object} filterData - { projectUuid, signal, hideGenericErrorAlert?, filters?, pagination?, onlyLegacy? }
 * @returns {Promise<Object>}
 */
export async function fetchConversationList(filterData) {
  const {
    projectUuid,
    signal,
    hideGenericErrorAlert = false,
    filters = {},
    pagination = null,
    onlyLegacy = false,
  } = filterData;

  const config = { signal, hideGenericErrorAlert };
  const legacyEndpoint = LEGACY_ENDPOINT_PATH(projectUuid);
  const newEndpoint = NEW_ENDPOINT_PATH(projectUuid);

  if (isValidPaginationPayload(pagination)) {
    const result = await fetchByNextUrl({
      nextUrl: pagination.next,
      config,
      source: pagination.source,
    });
    return { ...result, _paginationSource: pagination.source };
  }

  const params = ConversationAdapter.toApi({ ...filters });

  const fetchLegacy = (paramsToUse) =>
    fetchConversations({
      url: legacyEndpoint,
      params: paramsToUse,
      config,
      source: LEGACY_SOURCE,
    });

  const fetchNew = (paramsToUse) =>
    fetchConversations({
      url: newEndpoint,
      params: paramsToUse,
      config,
      source: NEW_SOURCE,
    });

  const startDate = parseDateParam(params.start_date);
  const endDate = parseDateParam(params.end_date);
  const mode = getConversationMode(startDate, endDate);

  if (mode === 'legacy') return fetchLegacy(params);
  if (mode === 'new') return fetchNew(params);

  if (onlyLegacy) {
    const legacyEndDate = getLegacyEndDate();
    const legacyParams = {
      ...params,
      end_date: formatDateParam(legacyEndDate),
    };
    const result = await fetchLegacy(legacyParams);
    return { ...result, _paginationSource: LEGACY_SOURCE };
  }

  const newParams = {
    ...params,
    start_date: formatDateParam(CONVERSATIONS_SWITCH_DATE),
  };
  const result = await fetchNew(newParams);
  return { ...result, _paginationSource: NEW_SOURCE };
}
