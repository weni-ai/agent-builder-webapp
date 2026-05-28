import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useAlertStore = defineStore('alert', () => {
  const id = ref(0);
  const alert = reactive({
    text: '',
    type: '',
    description: '',
  });

  function addAlert({ text, type, description = '' }) {
    id.value += 1;

    alert.text = text;
    alert.type = type;
    alert.description = description;
  }

  function closeAlert() {
    alert.text = '';
    alert.type = '';
    alert.description = '';
  }

  return {
    id,
    data: alert,

    add: addAlert,
    close: closeAlert,
  };
});
