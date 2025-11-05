import { defineStore } from 'pinia';
import { reactive } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { moduleLocalStorage } from '@/utils/storage';

export const useUserStore = defineStore('User', () => {
  const user = reactive({
    email: null,
    token: moduleLocalStorage.getItem('authToken') || null,
  });

  async function getUserDetails() {
    try {
      const { data } = await nexusaiAPI.agent_builder.user.read();

      Object.assign(user, data);
    } catch (error) {
      console.error(error);
    }
  }

  function setToken(token) {
    user.token = token;
    moduleLocalStorage.setItem('authToken', token);
  }

  return {
    user,
    getUserDetails,
    setToken,
  };
});
