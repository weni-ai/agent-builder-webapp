import request from '@/api/nexusaiRequest';

export const GuardrailsConfig = {
  read({ projectUuid }) {
    return request.$http.get(`api/${projectUuid}/guardrails-config/`);
  },

  update({ projectUuid, payload, requestOptions = {} }) {
    return request.$http.patch(
      `api/${projectUuid}/guardrails-config/`,
      payload,
      {
        hideGenericErrorAlert: true,
        ...requestOptions,
      },
    );
  },
};
