import nexusRequest from '../nexusaiRequest';

const request = nexusRequest;

export const Simulation = {
  setManagerModel({ projectUuid, managerFoundationModel, urn }) {
    return request.$http.post(`api/${projectUuid}/simulation/manager-model/`, {
      manager_foundation_model: managerFoundationModel,
      contact_urn: urn,
    });
  },

  endSession({ projectUuid, urn }) {
    return request.$http.post(`api/${projectUuid}/simulation/end-session/`, {
      contact_urn: urn,
    });
  },
};
