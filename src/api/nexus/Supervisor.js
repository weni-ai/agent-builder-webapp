import nexusRequest from '../nexusaiRequest';
import { ConversationAdapter } from '../adapters/supervisor/conversation';

const CONVERSATIONS_SWITCH_DATE = new Date(Date.UTC(2026, 1, 4));
const LEGACY_SOURCE = 'legacy';
const NEW_SOURCE = 'v2';

const parseDateParam = (value) => {
  if (!value) return null;

  const [day, month, year] = value.split('-').map(Number);

  if (!day || !month || !year) return null;

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateParam = (date) => {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};

const addSourceToResults = (data, source) => ({
  ...data,
  results: data.results?.map((result) => ({ ...result, source })) || [],
});

const fetchConversations = async ({ url, params, config, source }) => {
  const { data } = await nexusRequest.$http.get(
    `${url}?${new URLSearchParams(params)}`,
    config,
  );

  const adaptedData = ConversationAdapter.fromApi(data) || { results: [] };

  return addSourceToResults(adaptedData, source);
};

const mergeConversationResults = (newData, legacyData) => {
  const newResults = Array.isArray(newData.results) ? newData.results : [];
  const legacyResults = Array.isArray(legacyData.results)
    ? legacyData.results
    : [];
  const count = (newData.count || 0) + (legacyData.count || 0);

  return {
    count,
    results: [...newResults, ...legacyResults],
  };
};

export const Supervisor = {
  conversations: {
    async list(filterData) {
      const {
        projectUuid,
        signal,
        hideGenericErrorAlert = false,
        filters = {},
      } = filterData;

      const params = ConversationAdapter.toApi({ ...filters });

      const config = { signal, hideGenericErrorAlert };

      const legacyEndpoint = `/api/${projectUuid}/supervisor/`;
      const newEndpoint = `/api/v2/${projectUuid}/conversations`;

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

      const fetchNewAndLegacy = async () => {
        const legacyEndDate = new Date(CONVERSATIONS_SWITCH_DATE);
        legacyEndDate.setUTCDate(legacyEndDate.getUTCDate() - 1);

        const legacyParams = {
          ...params,
          end_date: formatDateParam(legacyEndDate),
        };

        const newParams = {
          ...params,
          start_date: formatDateParam(CONVERSATIONS_SWITCH_DATE),
        };

        const [newData, legacyData] = await Promise.all([
          fetchNew(newParams),
          fetchLegacy(legacyParams),
        ]);

        return mergeConversationResults(newData, legacyData);
      };

      const startDate = parseDateParam(params.start_date);
      const endDate = parseDateParam(params.end_date);

      if (!startDate || !endDate || endDate < CONVERSATIONS_SWITCH_DATE) {
        return fetchLegacy(params);
      }

      if (startDate >= CONVERSATIONS_SWITCH_DATE) {
        return fetchNew(params);
      }

      return fetchNewAndLegacy();
    },

    async getById({ projectUuid, start, end, urn, next }) {
      const params = {
        start,
        end,
        contact_urn: urn,
      };

      let url = `/api/${projectUuid}/conversations/?${new URLSearchParams(params)}`;

      if (next) {
        url = next.slice(next.indexOf('/api'));
      }

      const { data } = await nexusRequest.$http.get(url);

      return data;
    },

    async getLogs({ projectUuid, messageId }) {
      const { data } = await nexusRequest.$http.get(
        `api/agents/traces/?project_uuid=${projectUuid}&log_id=${messageId}`,
      );

      return data;
    },

    async getTopics({ projectUuid }) {
      const { data } = await nexusRequest.$http.get(
        `/api/${projectUuid}/topics/`,
      );
      return data;
    },

    async export({ projectUuid, token }) {
      const { data } = await nexusRequest.$http.post('/api/reports', {
        auth_token: token,
        project_uuid: projectUuid,
      });
      return data;
    },

    async getExportEmails({ projectUuid }) {
      const { data } = await nexusRequest.$http.get(
        `/api/reports?project_uuid=${projectUuid}`,
      );
      return data;
    },
  },
};
