import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import WorkspaceCredentials from '../WorkspaceCredentials.vue';
import Credentials from '@/components/Tunings/Credentials/index.vue';

describe('WorkspaceCredentials.vue', () => {
  let wrapper;

  const createWrapper = (attrs = {}) => {
    wrapper = shallowMount(WorkspaceCredentials, {
      attrs,
      global: {
        stubs: {
          FederatedWrapper: {
            template: '<div data-testid="federated-wrapper"><slot /></div>',
          },
        },
      },
    });
  };

  const findFederatedWrapper = () =>
    wrapper.find('[data-testid="federated-wrapper"]');

  const findCredentials = () => wrapper.findComponent(Credentials);

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders FederatedWrapper', () => {
    createWrapper();

    expect(findFederatedWrapper().exists()).toBe(true);
  });

  it('renders Credentials component inside FederatedWrapper', () => {
    createWrapper();

    expect(findCredentials().exists()).toBe(true);
  });

  it('passes attributes to Credentials component', () => {
    const testAttrs = {
      'data-custom': 'test-value',
      class: 'custom-class',
    };

    createWrapper(testAttrs);

    const credentials = findCredentials();
    expect(credentials.attributes('data-custom')).toBe('test-value');
    expect(credentials.attributes('class')).toBe('custom-class');
  });

  it('does not inherit attrs on the root element', () => {
    createWrapper({ 'data-custom': 'test-value' });

    expect(wrapper.attributes('data-custom')).toBeUndefined();
  });
});
