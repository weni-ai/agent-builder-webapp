import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { format } from 'date-fns';
import { enUS, es as esLocale, ptBR } from 'date-fns/locale';

import UpgradeDisclaimer from '../UpgradeDisclaimer.vue';
import i18n from '@/utils/plugins/i18n';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

describe('UpgradeDisclaimer.vue', () => {
  let wrapper;
  let managerSelectorStore;
  let pinia;

  const managerOptionsMock = {
    currentManager: 'manager-2.5',
    serverTime: '2026-01-08T13:00:00Z',
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

  const localeFormats = {
    en: { locale: enUS, pattern: 'MMMM d, yyyy' },
    es: { locale: esLocale, pattern: "d 'de' MMMM 'de' yyyy" },
    'pt-br': { locale: ptBR, pattern: "d 'de' MMMM 'de' yyyy" },
  };

  const mountComponent = () => {
    pinia = createTestingPinia({
      stubActions: false,
    });

    managerSelectorStore = useManagerSelectorStore();
    managerSelectorStore.options = {
      currentManager: 'manager-2.5',
      serverTime: '2026-01-08T13:00:00Z',
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

    wrapper = shallowMount(UpgradeDisclaimer, {
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

  it('renders the disclaimer with formatted date and translations when visible', () => {
    const disclaimer = wrapper.findComponent(
      '[data-testid="upgrade-disclaimer"]',
    );
    const normalizedLocale = i18n.global.locale?.toLowerCase() || 'en';
    const localeConfig = localeFormats[normalizedLocale] || localeFormats.en;
    const expectedDate = format(
      new Date(managerOptionsMock.managers.legacy.deprecation),
      localeConfig.pattern,
      {
        locale: localeConfig.locale,
      },
    );

    expect(disclaimer.exists()).toBe(true);
    expect(disclaimer.props('type')).toBe('attention');
    expect(disclaimer.props('title')).toBe(
      i18n.global.t(
        'agent_builder.tunings.manager.upgrade_banner.disclaimer_title_with_date',
        {
          manager_name: managerOptionsMock.managers.new.label,
          date: expectedDate,
        },
      ),
    );
    expect(disclaimer.props('description')).toBe(
      i18n.global.t(
        'agent_builder.tunings.manager.upgrade_banner.manager_2_dot_6_disclaimer_description',
      ),
    );
  });
});
