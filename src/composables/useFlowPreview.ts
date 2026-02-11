import { ref } from 'vue';
import { v4 as createUUID } from 'uuid';
import { useProjectStore } from '@/store/Project';

interface PreviewContact {
  uuid: string;
  urn: string;
}

export default function useFlowPreview() {
  const projectStore = useProjectStore();

  const preview = ref<{ contact: PreviewContact }>({
    contact: {
      uuid: '',
      urn: '',
    },
  });

  function previewInit() {
    const numberBasedOnProjectUuid = projectStore.uuid
      ?.slice(-12)
      .split('')
      .map((char: string) =>
        char.charCodeAt(0).toString().slice(-2).padStart(2, '0'),
      )
      .join('');

    const threeRandomDigits = String(Math.floor(Math.random() * 1000)).padStart(
      3,
      '0',
    );

    const urn = `tel:${numberBasedOnProjectUuid}${threeRandomDigits}`;

    preview.value.contact = {
      uuid: createUUID(),
      urn: urn,
    };
  }

  return {
    preview,
    previewInit,
  };
}
