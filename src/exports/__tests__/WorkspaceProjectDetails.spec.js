import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import WorkspaceProjectDetails from '../WorkspaceProjectDetails.vue';
import ProjectDetailsModal from '@/components/Tunings/ProjectDetailsModal/index.vue';

describe('WorkspaceProjectDetails.vue', () => {
  let wrapper;

  const createWrapper = (attrs = {}) => {
    wrapper = shallowMount(WorkspaceProjectDetails, {
      attrs: { modelValue: false, ...attrs },
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

  const findProjectDetailsModal = () =>
    wrapper.findComponent(ProjectDetailsModal);

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders FederatedWrapper', () => {
    createWrapper();

    expect(findFederatedWrapper().exists()).toBe(true);
  });

  it('renders ProjectDetailsModal component inside FederatedWrapper', () => {
    createWrapper();

    expect(findProjectDetailsModal().exists()).toBe(true);
  });

  it('passes attributes to ProjectDetailsModal component', () => {
    const testAttrs = {
      'data-custom': 'test-value',
      'aria-label': 'project details',
    };

    createWrapper(testAttrs);

    const modal = findProjectDetailsModal();
    expect(modal.attributes('data-custom')).toBe('test-value');
    expect(modal.attributes('aria-label')).toBe('project details');
  });

  it('does not inherit attrs on the root element', () => {
    createWrapper({ 'data-custom': 'test-value' });

    expect(wrapper.attributes('data-custom')).toBeUndefined();
  });
});
