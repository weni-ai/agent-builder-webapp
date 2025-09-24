import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useTuningsStore } from '@/store/Tunings';
import Unnnic from '@weni/unnnic-system';

import i18n from '@/utils/plugins/i18n';

import CredentialsForm from '../Credentials/CredentialsForm.vue';

describe('CredentialsForm.vue', () => {
  let wrapper;
  let store;

  const mockCredentials = [
    {
      label: 'API_KEY',
      placeholder: 'Enter your API key',
      value: '',
      is_confidential: true,
      agents_using: [{ name: 'Agent 1' }, { name: 'Agent 2' }],
    },
    {
      label: 'BASE_URL',
      placeholder: 'https://api.example.com',
      value: 'https://test.com',
      is_confidential: false,
      agents_using: [],
    },
  ];

  beforeEach(() => {
    wrapper = shallowMount(CredentialsForm, {
      props: {
        credentials: mockCredentials,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              Tunings: {
                credentials: {
                  data: {
                    myAgents: [],
                    officialAgents: [],
                  },
                  status: 'success',
                },
              },
            },
          }),
        ],
        stubs: {
          UnnnicIntelligenceText: {
            template: '<div><slot /></div>',
          },
          UnnnicFormElement: Unnnic.unnnicFormElement,
          UnnnicInput: Unnnic.unnnicInput,
        },
        components: {
          UnnnicFormElement: Unnnic.unnnicFormElement,
          UnnnicInput: Unnnic.unnnicInput,
        },
      },
    });
    store = useTuningsStore();
  });

  const getInputs = () =>
    wrapper.findAllComponents(
      'text-input-stub[data-testid="credentials-form-input"]',
    );

  const getFormElements = () =>
    wrapper.findAllComponents('[data-testid="credentials-form-element"]');

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('should mount the component properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render CredentialsSkeleton when credentials data is not available', async () => {
    store.credentials.data = null;
    await wrapper.vm.$nextTick();

    const skeleton = wrapper.findComponent(
      '[data-testid="credentials-skeleton"]',
    );
    expect(skeleton.exists()).toBe(true);
  });

  it('should display message when credentials array is empty', async () => {
    await wrapper.setProps({ credentials: [] });

    const emptyMessage = wrapper.find(
      '[data-testid="credentials-description"]',
    );
    expect(emptyMessage.exists()).toBe(true);
    expect(emptyMessage.text()).toBe(
      i18n.global.t('router.tunings.credentials.no_credentials'),
    );
  });

  it('should render form elements for each credential', () => {
    const formElements = getFormElements();
    expect(formElements).toHaveLength(mockCredentials.length);

    // Check labels were passed correctly
    expect(formElements[0].props('label')).toBe(mockCredentials[0].label);
    expect(formElements[1].props('label')).toBe(mockCredentials[1].label);
  });

  it('should render input fields with correct props', () => {
    const inputs = getInputs();

    expect(inputs).toHaveLength(mockCredentials.length);

    // Check first input (password type)
    expect(inputs[0].props('nativeType')).toBe('password');
    expect(inputs[0].props('placeholder')).toBe(mockCredentials[0].placeholder);

    // Check second input (text type)
    expect(inputs[1].props('nativeType')).toBe('text');
    expect(inputs[1].props('placeholder')).toBe(mockCredentials[1].placeholder);
  });

  it('should update credential value when input changes', async () => {
    const inputs = getInputs();

    await inputs[0].vm.$emit('update:modelValue', 'new-api-key');

    expect(mockCredentials[0].value).toBe('new-api-key');
  });

  it('should display the correct description for credentials with agents', () => {
    const formElements = getFormElements();

    expect(formElements[0].props('message')).toBe(
      `${i18n.global.t('router.tunings.credentials.used_by')} Agent 1 and Agent 2`,
    );
  });

  it('should display "no agents using" message for credentials without agents', async () => {
    await wrapper.setProps({
      credentials: [
        ...mockCredentials,
        { ...mockCredentials[0], agents_using: [] },
      ],
    });

    const formElements = getFormElements();
    expect(formElements[1].props('message')).toBe(
      i18n.global.t('router.tunings.credentials.no_agents_using'),
    );
  });

  it('should use label as placeholder when placeholder is not provided', async () => {
    const credentialsWithoutPlaceholder = [
      {
        label: 'API_KEY',
        value: '',
        is_confidential: true,
      },
    ];

    await wrapper.setProps({ credentials: credentialsWithoutPlaceholder });

    const input = getInputs()[0];
    expect(input.props('placeholder')).toBe('API_KEY');
  });
});
