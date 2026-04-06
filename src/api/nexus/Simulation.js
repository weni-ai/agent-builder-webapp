import nexusRequest from '../nexusaiRequest';

const request = nexusRequest;

export const Simulation = {
  setManagerModel({ projectUuid, managerFoundationModel }) {
    return request.$http.post(`api/${projectUuid}/simulation/manager-model/`, {
      manager_foundation_model: managerFoundationModel,
    });
  },

  endSession({ projectUuid, urn }) {
    return request.$http.post(`api/${projectUuid}/simulation/end-session/`, {
      contact_urn: urn,
    });
  },
};
