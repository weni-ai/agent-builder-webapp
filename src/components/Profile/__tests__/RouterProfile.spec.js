import { describe, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';

import nexusaiAPI from '@/api/nexusaiAPI';

import RouterProfile from '@/views/Brain/RouterProfile/index.vue';

vi.spyOn(nexusaiAPI.router.profile, 'read').mockResolvedValue({
  data: {
    agent: {
      name: '',
      role: '',
      personality: '',
      goal: '',
    },
    instructions: [],
  },
});

const pinia = createTestingPinia({ stubActions: false });

describe('RouterProfile', () => {
  let wrapper;
  let profileStore;
  let alertStore;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(RouterProfile, {
      global: {
        plugins: [pinia],
      },
    });

    profileStore = useProfileStore();
    alertStore = useAlertStore();
  });

  it('renders all child components', () => {
    expect(wrapper.findAllComponents('[data-testid="divider"]').length).toBe(2);
    expect(wrapper.findComponent('[data-testid="general-info"]').exists()).toBe(
      true,
    );
    expect(wrapper.findComponent('[data-testid="instructions"]').exists()).toBe(
      true,
    );
  });

  it('calls profile load on mount', () => {
    expect(profileStore.load).toHaveBeenCalled();
  });
});
