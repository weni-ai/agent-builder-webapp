import { defineStore } from 'pinia';
import { reactive } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { moduleStorage } from '@/utils/storage';

export const useUserStore = defineStore('User', () => {
  const user = reactive({
    email: null,
    token: moduleStorage.getItem('authToken') || null,
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
    moduleStorage.setItem('authToken', token);
  }

  return {
    user,
    getUserDetails,
    setToken,
  };
});
