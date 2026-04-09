import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ManagerSelector from '../index.vue';
import i18n from '@/utils/plugins/i18n';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useTuningsStore } from '@/store/Tunings';

describe('ManagerSelector.vue', () => {
  let wrapper;
  let managerSelectorStore;
  let tuningsStore;
  let pinia;

  const title = () => wrapper.find('[data-testid="manager-selector-title"]');
  const radioGroup = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-group"]');
  const radioNew = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-new"]');
  const radioLegacy = () =>
    wrapper.findComponent('[data-testid="manager-selector-radio-legacy"]');
  const onlyNewManager = () =>
    wrapper.find('[data-testid="manager-selector-only-new"]');
  const onlyNewTitle = () =>
    wrapper.find('[data-testid="manager-selector-only-new-title"]');
  const onlyNewDescription = () =>
    wrapper.find('[data-testid="manager-selector-only-new-description"]');
  const radiosSkeleton = () =>
    wrapper.findComponent('[data-testid="manager-selector-radios-skeleton"]');
  const noComponentsDisclaimer = () =>
    wrapper.findComponent('[data-testid="no-components-disclaimer"]');

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
    tuningsStore = useTuningsStore();
    managerSelectorStore.options = JSON.parse(JSON.stringify(managerMock));
    managerSelectorStore.selectedManager =
      managerSelectorStore.options.currentManager;
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

  it('renders the title with correct translation', () => {
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

  it('shows the skeleton while manager options are loading', async () => {
    managerSelectorStore.status = 'loading';
    await nextTick();

    expect(radiosSkeleton().exists()).toBe(true);
    expect(radioGroup().exists()).toBe(false);
  });

  it('renders the radio group once the manager options are loaded', async () => {
    managerSelectorStore.status = 'loading';
    await nextTick();

    managerSelectorStore.status = 'success';
    await nextTick();

    expect(radiosSkeleton().exists()).toBe(false);
    expect(radioGroup().exists()).toBe(true);
  });

  it('renders only the new manager when legacy is missing', async () => {
    managerSelectorStore.options.managers.legacy = null;
    await nextTick();

    expect(onlyNewManager().exists()).toBe(true);
    expect(radioGroup().exists()).toBe(false);
    expect(onlyNewTitle().text()).toBe(managerMock.managers.new.label);
    expect(onlyNewDescription().text()).toBe(
      i18n.global.t(
        'agent_builder.tunings.manager.only_new_manager_description',
        {
          manager_name: managerMock.managers.new.label,
        },
      ),
    );
  });

  describe('no-components disclaimer', () => {
    it('shows the disclaimer when new manager has accept_components false', async () => {
      managerSelectorStore.options.managers.new.accept_components = false;
      await nextTick();

      const disclaimer = noComponentsDisclaimer();
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.props('type')).toBe('neutral');
      expect(disclaimer.props('description')).toBe(
        i18n.global.t('agent_builder.tunings.manager.no_components_support', {
          manager_name: managerMock.managers.new.label,
        }),
      );
    });

    it('does not show the disclaimer when accept_components is not false', () => {
      expect(noComponentsDisclaimer().exists()).toBe(false);
    });
  });

  describe('new manager radio disabled state', () => {
    it('disables the new manager radio when it does not accept components and components is enabled', async () => {
      managerSelectorStore.options.managers.new.accept_components = false;
      tuningsStore.settings.data.components = true;
      managerSelectorStore.selectedManager = managerMock.managers.legacy.id;
      await nextTick();

      expect(radioNew().props('disabled')).toBe(true);
    });

    it('does not disable the new manager radio when components is off', async () => {
      managerSelectorStore.options.managers.new.accept_components = false;
      tuningsStore.settings.data.components = false;
      managerSelectorStore.selectedManager = managerMock.managers.legacy.id;
      await nextTick();

      expect(radioNew().props('disabled')).toBe(false);
    });

    it('does not disable the new manager radio when it accepts components', async () => {
      tuningsStore.settings.data.components = true;
      managerSelectorStore.selectedManager = managerMock.managers.legacy.id;
      await nextTick();

      expect(radioNew().props('disabled')).toBe(false);
    });

    it('does not disable the new manager radio when it is already selected', async () => {
      managerSelectorStore.options.managers.new.accept_components = false;
      tuningsStore.settings.data.components = true;
      managerSelectorStore.selectedManager = managerMock.managers.new.id;
      await nextTick();

      expect(radioNew().props('disabled')).toBe(false);
    });
  });
});
