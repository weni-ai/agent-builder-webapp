import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ManagerDisclaimers from '../ManagerDisclaimers.vue';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

describe('ManagerDisclaimers.vue', () => {
  let wrapper;
  let managerSelectorStore;

  const POST_UPGRADE_DISCLAIMER_STORAGE_KEY =
    'agentBuilder_manager-selector-post-upgrade-disclaimer';

  const postUpgradeDisclaimer = () =>
    wrapper.findComponent('[data-testid="post-upgrade-disclaimer"]');
  const upgradeDisclaimer = () =>
    wrapper.findComponent('[data-testid="upgrade-disclaimer"]');
  const upgradeBanner = () =>
    wrapper.findComponent('[data-testid="manager-upgrade-card"]');

  const managerMock = {
    currentManager: 'manager-2.5',
    managers: {
      new: {
        id: 'manager-2.6',
        label: 'Manager 2.6',
      },
      legacy: {
        id: 'manager-2.5',
        label: 'Manager 2.5',
        deprecation: '2026-04-15',
      },
    },
    serverTime: '2026-01-08T13:00:00Z',
  };

  const createWrapper = () => {
    const pinia = createTestingPinia({ stubActions: false });
    managerSelectorStore = useManagerSelectorStore();
    managerSelectorStore.options = JSON.parse(JSON.stringify(managerMock));
    managerSelectorStore.selectedManager =
      managerSelectorStore.options.currentManager;
    managerSelectorStore.status = 'success';

    wrapper = shallowMount(ManagerDisclaimers, {
      global: { plugins: [pinia] },
    });
  };

  beforeEach(() => {
    window.localStorage.removeItem(POST_UPGRADE_DISCLAIMER_STORAGE_KEY);
    createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('shows the upgrade banner when manager needs upgrade and deprecation is not imminent', () => {
    expect(upgradeBanner().exists()).toBe(true);
    expect(upgradeDisclaimer().exists()).toBe(false);
    expect(postUpgradeDisclaimer().exists()).toBe(false);
  });

  it('hides the upgrade banner when current manager is already the new one', async () => {
    managerSelectorStore.options.currentManager = managerMock.managers.new.id;
    await nextTick();

    expect(upgradeBanner().exists()).toBe(false);
  });

  it('shows the upgrade disclaimer when deprecation window is near', async () => {
    managerSelectorStore.options.serverTime = '2026-04-10T13:00:00Z';
    await nextTick();

    expect(upgradeDisclaimer().exists()).toBe(true);
    expect(upgradeBanner().exists()).toBe(false);
  });

  it('hides the upgrade disclaimer when deprecation is not imminent', async () => {
    managerSelectorStore.options.serverTime = '2026-03-01T13:00:00Z';
    await nextTick();

    expect(upgradeDisclaimer().exists()).toBe(false);
    expect(upgradeBanner().exists()).toBe(true);
  });

  it('shows the post-upgrade disclaimer when legacy is deprecated and using new manager', async () => {
    managerSelectorStore.options.currentManager = managerMock.managers.new.id;
    managerSelectorStore.options.serverTime = '2026-04-20T13:00:00Z';
    await nextTick();

    expect(postUpgradeDisclaimer().exists()).toBe(true);
    expect(upgradeDisclaimer().exists()).toBe(false);
    expect(upgradeBanner().exists()).toBe(false);
  });

  it('does not show the post-upgrade disclaimer when using the legacy manager', async () => {
    managerSelectorStore.options.currentManager =
      managerMock.managers.legacy.id;
    managerSelectorStore.options.serverTime = '2026-04-20T13:00:00Z';
    await nextTick();

    expect(postUpgradeDisclaimer().exists()).toBe(false);
    expect(upgradeBanner().exists()).toBe(true);
  });

  it('calls resetPostUpgradeDisclaimerSession on unmount', () => {
    const resetSpy = vi.spyOn(
      managerSelectorStore,
      'resetPostUpgradeDisclaimerSession',
    );

    wrapper.unmount();

    expect(resetSpy).toHaveBeenCalled();
  });
});
