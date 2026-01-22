import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import FirstStepContent from '../FirstStepContent.vue';

const getSystemObjectMock = vi.fn((system) => ({
  name: `${system} name`,
  icon: `${system.toLowerCase()}-icon`,
}));

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemObject: getSystemObjectMock,
  }),
}));

describe('FirstStepContent', () => {
  const systems = ['VTEX', 'SYNERISE'];
  let wrapper;
  let updateSelectedSystem;

  const createWrapper = (overrideProps = {}) => {
    updateSelectedSystem = vi.fn();

    wrapper = mount(FirstStepContent, {
      props: {
        systems,
        MCPs: [],
        selectedSystem: 'VTEX',
        'onUpdate:selectedSystem': updateSelectedSystem,
        ...overrideProps,
      },
    });

    return wrapper;
  };

  const findRoot = () => wrapper.find('[data-testid="concierge-first-step"]');
  const findSystemRadios = () =>
    wrapper.findAllComponents('[data-testid="concierge-first-step-radio"]');

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the heading and description texts', () => {
    const textContent = findRoot().text();

    expect(textContent).toContain('System selection');
    expect(textContent).toContain('Select the data source system');
  });

  it('renders a radio for each available system', () => {
    const radios = findSystemRadios();

    expect(radios).toHaveLength(systems.length);
    expect(radios[0].props('selected')).toBe(true);
    expect(radios[1].props('selected')).toBe(false);
    expect(getSystemObjectMock).toHaveBeenNthCalledWith(1, 'VTEX');
    expect(getSystemObjectMock).toHaveBeenNthCalledWith(2, 'SYNERISE');
  });

  it('renders the MCP count description in the DOM for each system', () => {
    createWrapper({
      MCPs: [{ system: 'VTEX' }, { system: 'VTEX' }, { system: 'SYNERISE' }],
    });

    const radios = findSystemRadios();
    const firstRadioDescription = radios[0].find(
      '[data-testid="modal-assign-agent-radio-description"]',
    );
    const secondRadioDescription = radios[1].find(
      '[data-testid="modal-assign-agent-radio-description"]',
    );

    expect(firstRadioDescription.exists()).toBe(true);
    expect(firstRadioDescription.text()).toBe(i18n.t('agents.assign.mcps_available', { count: 2 }));

    expect(secondRadioDescription.exists()).toBe(true);
    expect(secondRadioDescription.text()).toBe(i18n.t('agents.assign.mcps_available', { count: 1 }));
  });

  it('emits update when selecting a different system', async () => {
    const radios = findSystemRadios();
    await radios[1].trigger('click');

    expect(updateSelectedSystem).toHaveBeenCalledWith('SYNERISE');
  });

  it('does not emit update when selecting the already selected system', async () => {
    const radios = findSystemRadios();
    await radios[0].trigger('click');

    expect(updateSelectedSystem).not.toHaveBeenCalled();
  });
});
