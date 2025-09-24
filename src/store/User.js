import { defineStore } from 'pinia';
import { reactive } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';

export const useUserStore = defineStore('User', () => {
  const user = reactive({
    email: null,
    token: localStorage.getItem('authToken') || null,
  });

  async function getUserDetails() {
    try {
      const { data } = await nexusaiAPI.agent_builder.user.read();

      Object.assign(user, data);
    } catch (error) {
      console.error(error);
    }
  }

  return {
    user,
    getUserDetails,
  };
});
