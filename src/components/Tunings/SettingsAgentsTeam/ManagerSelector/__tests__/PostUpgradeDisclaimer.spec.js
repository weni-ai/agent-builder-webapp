import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import PostUpgradeDisclaimer from '../PostUpgradeDisclaimer.vue';
import i18n from '@/utils/plugins/i18n';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

describe('PostUpgradeDisclaimer.vue', () => {
  let wrapper;
  let managerSelectorStore;
  let pinia;

  const mountComponent = () => {
    pinia = createTestingPinia({
      stubActions: false,
    });

    managerSelectorStore = useManagerSelectorStore();
    managerSelectorStore.options = {
      currentManager: 'manager-2.6',
      serverTime: '2026-01-15T13:00:00Z',
      managers: {
        new: {
          id: 'manager-2.6',
          label: 'Manager 2.6',
        },
        legacy: {
          id: 'manager-2.5',
          label: 'Manager 2.5',
          deprecation: '2026-01-15T00:00:00Z',
        },
      },
    };

    wrapper = shallowMount(PostUpgradeDisclaimer, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    mountComponent();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the post-upgrade disclaimer with the correct translations', () => {
    const disclaimer = wrapper.findComponent(
      '[data-testid="post-upgrade-disclaimer"]',
    );

    expect(disclaimer.exists()).toBe(true);
    expect(disclaimer.props('type')).toBe('success');
    expect(disclaimer.props('title')).toBe(
      i18n.global.t(
        'agent_builder.tunings.manager.upgrade_banner.auto_upgrade_success_title',
        {
          manager_name: 'Manager 2.6',
        },
      ),
    );
    expect(disclaimer.props('description')).toBe(
      i18n.global.t(
        'agent_builder.tunings.manager.upgrade_banner.auto_upgrade_success_description',
      ),
    );
  });
});
