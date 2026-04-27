import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import WorkspaceChangesHistory from '../WorkspaceChangesHistory.vue';
import ChangesHistory from '@/components/Tunings/ChangesHistory.vue';

describe('WorkspaceChangesHistory.vue', () => {
  let wrapper;

  const createWrapper = (attrs = {}) => {
    wrapper = shallowMount(WorkspaceChangesHistory, {
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

  const findChangesHistory = () => wrapper.findComponent(ChangesHistory);

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders FederatedWrapper', () => {
    createWrapper();

    expect(findFederatedWrapper().exists()).toBe(true);
  });

  it('renders ChangesHistory component inside FederatedWrapper', () => {
    createWrapper();

    expect(findChangesHistory().exists()).toBe(true);
  });

  it('does not inherit attrs on the root element', () => {
    createWrapper({ 'data-custom': 'test-value' });

    expect(wrapper.attributes('data-custom')).toBeUndefined();
  });
});
