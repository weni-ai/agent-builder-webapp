import { describe, it, expect } from 'vitest';

import { VoiceSettingsAdapter } from '../voiceSettings.js';

describe('Tunings voiceSettings adapter', () => {
  describe('fromApi method', () => {
    const fromApiTestCases = [
      {
        name: 'transforms API data to store format',
        input: {
          audio_orchestration: true,
          agent_voice: 'onyx',
        },
        expected: {
          useVoice: true,
          selectedVoice: 'onyx',
        },
      },
      {
        name: 'handles API data with audio_orchestration false',
        input: {
          audio_orchestration: false,
          agent_voice: 'alloy',
        },
        expected: {
          useVoice: false,
          selectedVoice: 'alloy',
        },
      },
      {
        name: 'handles API data with empty agent_voice',
        input: {
          audio_orchestration: true,
          agent_voice: '',
        },
        expected: {
          useVoice: true,
          selectedVoice: '',
        },
      },
      {
        name: 'handles API data with null values',
        input: {
          audio_orchestration: null,
          agent_voice: null,
        },
        expected: {
          useVoice: null,
          selectedVoice: null,
        },
      },
      {
        name: 'preserves other fields from API response',
        input: {
          audio_orchestration: true,
          agent_voice: 'nova',
          extra_field: 'extra_value',
          another_field: 123,
        },
        expected: {
          useVoice: true,
          selectedVoice: 'nova',
          extra_field: 'extra_value',
          another_field: 123,
        },
      },
    ];

    fromApiTestCases.forEach(({ name, input, expected }) => {
      it(`${name}`, () => {
        const result = VoiceSettingsAdapter.fromApi(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('toApi method', () => {
    const toApiTestCases = [
      {
        name: 'transforms store data to API format',
        input: {
          useVoice: true,
          selectedVoice: 'onyx',
        },
        expected: {
          audio_orchestration: true,
          agent_voice: 'onyx',
        },
      },
      {
        name: 'handles store data with useVoice false',
        input: {
          useVoice: false,
          selectedVoice: 'alloy',
        },
        expected: {
          audio_orchestration: false,
          agent_voice: 'alloy',
        },
      },
      {
        name: 'handles store data with empty selectedVoice',
        input: {
          useVoice: true,
          selectedVoice: '',
        },
        expected: {
          audio_orchestration: true,
          agent_voice: '',
        },
      },
      {
        name: 'handles store data with null values',
        input: {
          useVoice: null,
          selectedVoice: null,
        },
        expected: {
          audio_orchestration: null,
          agent_voice: null,
        },
      },
      {
        name: 'preserves other fields from store data',
        input: {
          useVoice: true,
          selectedVoice: 'nova',
          extra_field: 'extra_value',
          another_field: 123,
        },
        expected: {
          audio_orchestration: true,
          agent_voice: 'nova',
          extra_field: 'extra_value',
          another_field: 123,
        },
      },
    ];

    toApiTestCases.forEach(({ name, input, expected }) => {
      it(`${name}`, () => {
        const result = VoiceSettingsAdapter.toApi(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('bidirectional transformation', () => {
    it('should maintain data integrity when transforming from API to store and back', () => {
      const apiData = {
        audio_orchestration: true,
        agent_voice: 'shimmer',
      };

      const storeData = VoiceSettingsAdapter.fromApi(apiData);
      const backToApi = VoiceSettingsAdapter.toApi(storeData);

      expect(backToApi).toEqual(apiData);
    });

    it('should maintain data integrity when transforming from store to API and back', () => {
      const storeData = {
        useVoice: false,
        selectedVoice: 'ballad',
      };

      const apiData = VoiceSettingsAdapter.toApi(storeData);
      const backToStore = VoiceSettingsAdapter.fromApi(apiData);

      expect(backToStore).toEqual(storeData);
    });
  });
});
