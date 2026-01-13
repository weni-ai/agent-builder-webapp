import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ManagerSelector from '../index.vue';
import i18n from '@/utils/plugins/i18n';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

describe('ManagerSelector.vue', () => {
  let wrapper;
  let managerSelectorStore;
  let pinia;

  const title = () => wrapper.find('[data-testid="manager-selector-title"]');
  const radioGroup = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-group"]');
  const radioNew = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-new"]');
  const radioLegacy = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-legacy"]');
  const upgradeBanner = () =>
    wrapper.findComponent('[data-testid="manager-upgrade-card"]');
  const upgradeDisclaimer = () =>
    wrapper.findComponent('[data-testid="upgrade-disclaimer"]');

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

  const mountComponent = () => {
    pinia = createTestingPinia({
      stubActions: false,
    });

    managerSelectorStore = useManagerSelectorStore();
    managerSelectorStore.options = managerMock;
    managerSelectorStore.selectedManager = managerMock.currentManager;
    managerSelectorStore.status = 'success';

    wrapper = mount(ManagerSelector, {
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
    vi.clearAllMocks();
  });

  it('renders the title with correct translation and styling', () => {
    expect(title().text()).toBe(
      i18n.global.t('agent_builder.tunings.manager.title'),
    );
  });

  it('binds the radio group to the selected manager and updates the value', () => {
    const group = radioGroup();

    expect(group.exists()).toBe(true);
    expect(group.props('state')).toBe('vertical');
    expect(group.props('modelValue')).toBe(managerMock.currentManager);

    group.vm.$emit('update:model-value', managerMock.managers.new.id);

    expect(managerSelectorStore.selectedManager).toBe(
      managerMock.managers.new.id,
    );
  });

  it('passes the correct props to each manager option', () => {
    expect(radioNew().props()).toMatchObject({
      label: 'Manager 2.6',
      value: 'manager-2.6',
      helper: i18n.global.t('agent_builder.tunings.manager.recommended'),
    });

    expect(radioLegacy().props()).toMatchObject({
      label: 'Manager 2.5',
      value: 'manager-2.5',
      helper: i18n.global.t('agent_builder.tunings.manager.legacy_model'),
    });
  });

  it('renders the "New" tag next to the latest manager option', () => {
    const newTag = wrapper.find(
      '[data-testid="manager-selector-radio-new-tag"]',
    );

    expect(newTag.exists()).toBe(true);
    expect(newTag.text()).toBe(
      i18n.global.t('agent_builder.tunings.manager.new'),
    );
  });

  it('only renders the upgrade banner when the selected manager differs from the new manager', async () => {
    managerSelectorStore.options.currentManager = managerMock.managers.new.id;
    await nextTick();

    expect(upgradeBanner().exists()).toBe(false);

    managerSelectorStore.options.currentManager =
      managerMock.managers.legacy.id;
    await nextTick();

    expect(upgradeBanner().exists()).toBe(true);
  });

  it('shows the upgrade disclaimer when the deprecation window is near', async () => {
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
});
