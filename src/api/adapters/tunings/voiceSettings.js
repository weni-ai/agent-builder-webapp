export const VoiceSettingsAdapter = {
  fromApi(apiData) {
    const { audio_orchestration, agent_voice, ...rest } = apiData;
    return {
      ...rest,
      useVoice: audio_orchestration,
      selectedVoice: agent_voice,
    };
  },

  toApi(storeData) {
    const { useVoice, selectedVoice, ...rest } = storeData;
    return {
      ...rest,
      audio_orchestration: useVoice,
      agent_voice: selectedVoice,
    };
  },
};
