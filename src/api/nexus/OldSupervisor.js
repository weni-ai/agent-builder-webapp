import billingRequest from '../billingRequest';
import nexusRequest from '../nexusaiRequest';

export default {
  conversations: {
    async list({ projectUuid, page, start, end, search, type }) {
      const params = {
        page,
        start,
        end,
        ...(search && { search }),
        ...(type && { human_support: type === 'forwarded_human_support' }),
      };

      const { data } = await billingRequest.$http.get(
        `${projectUuid}/conversations/?${new URLSearchParams(params)}`,
      );

      return data;
    },

    async forwardStats({ projectUuid, start, end }) {
      const { data } = await billingRequest.$http.get(
        `${projectUuid}/forward-stats/?start=${start}&end=${end}`,
      );

      return data;
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
