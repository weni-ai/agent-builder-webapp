import { defineStore } from 'pinia';
import { ref, watch, toValue } from 'vue';
import { useAlertStore } from './Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

export const useIndexingProcessStore = defineStore('IndexingProcess', () => {
  const itemsBeingProcessed = ref([]);
  const alertStore = useAlertStore();

  function addItemBeingProcessed(type, itemUuid, item) {
    const alreadyIn = itemsBeingProcessed.value.find(
      ({ uuid }) => uuid === itemUuid,
    );

    if (!alreadyIn) {
      itemsBeingProcessed.value.push({
        type,
        uuid: itemUuid,
        item,
      });
    }
  }

  function removeFirstItemBeingProcessed() {
    return itemsBeingProcessed.value.shift();
  }

  function moveFirstItemBeingProcessedToTheEnd() {
    const firstItem = removeFirstItemBeingProcessed();
    itemsBeingProcessed.value.push(firstItem);
  }

  async function checkIfItemHasAlreadyBeenProcessed() {
    const { type, uuid, item } = itemsBeingProcessed.value.at(0);

    await nexusaiAPI.knowledge[type]
      .read({
        uuid,
      })
      .then(({ data }) => {
        if (data.status === 'success') {
          removeFirstItemBeingProcessed();

          item.status = 'uploaded';
          item.file_name = data.file_name;
          item.created_at = data.created_at;

          if (type === 'files') {
            successMessage();
          }
        } else if (data.status === 'fail') {
          removeFirstItemBeingProcessed();

          item.status = data.status;
        } else {
          moveFirstItemBeingProcessedToTheEnd();
        }
      })
      .catch(() => {
        moveFirstItemBeingProcessedToTheEnd();
      });

    if (itemsBeingProcessed.value.length >= 1) {
      setTimeout(checkIfItemHasAlreadyBeenProcessed, 3000);
    }
  }

  watch(
    () => itemsBeingProcessed.value.length,
    (current, previous) => {
      const hasBeenAddedSomeItem = previous === 0 && current >= 1;

      if (hasBeenAddedSomeItem) {
        setTimeout(checkIfItemHasAlreadyBeenProcessed, 3000);
      }
    },
  );

  function successMessage() {
    alertStore.add({
      type: 'success',
      text: i18n.global.t(
        'content_bases.files.content_of_the_files_has_been_added',
      ),
    });
  }

  function useIndexingProcess(items, type) {
    watch(
      () => items,
      (items) => {
        toValue(items)
          .filter(({ status }) => status === 'processing')
          .forEach((item) => {
            addItemBeingProcessed(type, item.uuid, item);
          });
      },
      { deep: true },
    );
  }

  return {
    useIndexingProcess,
  };
});
