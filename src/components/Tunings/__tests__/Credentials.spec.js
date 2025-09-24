import { shallowMount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import { useTuningsStore } from '@/store/Tunings';

import i18n from '@/utils/plugins/i18n';

import Credentials from '../Credentials/index.vue';
import Text from '@/components/unnnic-intelligence/Text.vue';

const mockCredentials = [
  {
    label: 'BASE_URL',
    placeholder: 'https://api.vtex.com',
    value: '',
  },
  {
    label: 'VTEX_API_APPKEY',
    is_confidential: true,
    value: '',
  },
];

describe('Credentials.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    wrapper = shallowMount(Credentials, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Tunings: {
                credentials: {
                  data: {
                    myAgents: mockCredentials,
                    officialAgents: mockCredentials,
                  },
                  status: 'success',
                },
              },
            },
          }),
        ],

        stubs: {
          UnnnicIntelligenceText: Text,
        },
      },
    });
    store = useTuningsStore();
  });

  const credentialsForms = () =>
    wrapper.findAllComponents('[data-testid="credentials-form"]');

  it('should mount the component properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render two sections with descriptions', () => {
    const descriptions = wrapper.findAll(
      '[data-testid="credentials-description"]',
    );
    expect(descriptions).toHaveLength(2);

    expect(descriptions[0].text()).toBe(
      i18n.global.t('router.tunings.credentials.used_by_official_agents'),
    );
    expect(descriptions[1].text()).toBe(
      i18n.global.t('router.tunings.credentials.used_by_customized_agents'),
    );
  });

  it('should render two CredentialsForm components', () => {
    expect(credentialsForms()).toHaveLength(2);
  });

  it('should pass correct props to CredentialsForm components', () => {
    // Check official agents form
    expect(credentialsForms()[0].props('credentials')).toEqual(mockCredentials);

    // Check customized agents form
    expect(credentialsForms()[1].props('credentials')).toEqual(mockCredentials);
  });

  it('should render a divider between sections', () => {
    const divider = wrapper.findComponent(
      '[data-testid="credentials-divider"]',
    );
    expect(divider.exists()).toBe(true);
  });
});
