// Based on https://github.com/weni-ai/floweditor/blob/main/src/components/simulator/Simulator.tsx

import { ref } from 'vue';
import { v4 as createUUID } from 'uuid';

export default function useFlowPreview() {
  const preview = ref({
    contact: {
      fields: {},
      groups: [],
      urns: [],
      uuid: '',
    },
  });

  function previewInit({ contentBaseUuid }) {
    const numberBasedOnContentBaseUuid = contentBaseUuid
      .slice(-12)
      .split('')
      .map((char) => char.charCodeAt().toString().slice(-2).padStart(2, '0'))
      .join('');

    const threeRandomDigits = String(Math.floor(Math.random() * 1000)).padStart(
      3,
      '0',
    );

    const urn = `tel:${numberBasedOnContentBaseUuid}${threeRandomDigits}`;

    preview.value.contact = {
      uuid: createUUID(),
      urns: [urn],
      fields: {},
      groups: [],
      created_on: new Date().toISOString(),
    };
  }

  return {
    preview,
    previewInit,
  };
}
