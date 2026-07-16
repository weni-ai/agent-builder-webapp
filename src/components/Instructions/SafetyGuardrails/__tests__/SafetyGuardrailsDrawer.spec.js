import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import SafetyGuardrailsDrawer from '../SafetyGuardrailsDrawer.vue';
import SafetyGuardrailsTopicList from '../SafetyGuardrailsTopicList.vue';
import SafetyGuardrailsBlockMessage from '../SafetyGuardrailsBlockMessage.vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      guardrails_config: {
        read: vi.fn(),
        update: vi.fn(),
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'project-uuid' }),
}));

vi.mock('@/store/Alert', () => ({
  useAlertStore: () => ({
    add: vi.fn(),
  }),
}));

const storeConfig = {
  topics: [
    { id: 'politics', enabled: true },
    { id: 'hate', enabled: false },
  ],
  blockingMessage: 'Blocked message',
  writable: true,
};

describe('SafetyGuardrailsDrawer.vue', () => {
  let wrapper;

  const createWrapper = async (props = {}) => {
    nexusaiAPI.router.guardrails_config.read.mockResolvedValue(storeConfig);

    wrapper = mount(SafetyGuardrailsDrawer, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            stubActions: false,
          }),
        ],
        stubs: {
          UnnnicDrawerNext: false,
          SafetyGuardrailsTopicList: true,
          SafetyGuardrailsBlockMessage: true,
        },
      },
    });

    await flushPromises();
    await nextTick();
  };

  const findTitle = () =>
    wrapper.find('[data-testid="safety-guardrails-drawer-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="safety-guardrails-drawer-description"]');
  const findTopicList = () => wrapper.findComponent(SafetyGuardrailsTopicList);
  const findBlockMessage = () =>
    wrapper.findComponent(SafetyGuardrailsBlockMessage);
  const findDescriptionSkeleton = () =>
    wrapper.find(
      '[data-testid="safety-guardrails-drawer-description-skeleton"]',
    );
  const findSave = () =>
    wrapper.findComponent('[data-testid="safety-guardrails-drawer-save"]');
  const findCancel = () =>
    wrapper.findComponent('[data-testid="safety-guardrails-drawer-cancel"]');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders drawer title, description, topics, and block message from the store', async () => {
    await createWrapper();

    expect(findTitle().text()).toBe('Safety guardrails');
    expect(findDescription().text()).toBe(
      'When a topic is on, Manager refuses to discuss it. Turn off to allow',
    );
    expect(nexusaiAPI.router.guardrails_config.read).toHaveBeenCalled();
    expect(findTopicList().props('topics')).toEqual(storeConfig.topics);
    expect(findTopicList().props('loading')).toBe(false);
    expect(findBlockMessage().props('modelValue')).toBe(
      apiConfig.blocking_message,
    );
    expect(findBlockMessage().props('maxLength')).toBe(250);
  });

  it('passes loading true to the topic list while fetching', async () => {
    let resolveFetch;
    nexusaiAPI.router.guardrails_config.read.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    wrapper = mount(SafetyGuardrailsDrawer, {
      props: { modelValue: true },
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            stubActions: false,
          }),
        ],
        stubs: {
          UnnnicDrawerNext: false,
          SafetyGuardrailsTopicList: true,
          SafetyGuardrailsBlockMessage: true,
        },
      },
    });

    await nextTick();

    expect(findTopicList().props('loading')).toBe(true);
    expect(findDescriptionSkeleton().exists()).toBe(true);
    expect(findBlockMessage().exists()).toBe(false);

    resolveFetch(storeConfig);
    await flushPromises();

    expect(findTopicList().props('loading')).toBe(false);
    expect(findDescriptionSkeleton().exists()).toBe(false);
    expect(findBlockMessage().exists()).toBe(true);
  });

  it('keeps Save disabled until a draft change is made', async () => {
    await createWrapper();

    expect(findSave().props('disabled')).toBe(true);

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    await nextTick();

    expect(findSave().props('disabled')).toBe(false);
  });

  it('enables Save when the block message draft changes', async () => {
    await createWrapper();

    expect(findSave().props('disabled')).toBe(true);

    findBlockMessage().vm.$emit('update:modelValue', 'Updated block message');
    await nextTick();

    expect(findSave().props('disabled')).toBe(false);
  });

  it('saves changed category states and closes the drawer', async () => {
    await createWrapper();
    nexusaiAPI.router.guardrails_config.update.mockResolvedValue(storeConfig);

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    await nextTick();

    await findSave().trigger('click');
    await flushPromises();

    expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      data: {
        categoryStates: { politics: false },
      },
    });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('saves changed block message and closes the drawer', async () => {
    await createWrapper();
    nexusaiAPI.router.guardrails_config.update.mockResolvedValue({
      data: {
        ...apiConfig,
        blocking_message: 'Updated block message',
        blocking_message_is_custom: true,
      },
    });

    findBlockMessage().vm.$emit('update:modelValue', 'Updated block message');
    await nextTick();

    await findSave().trigger('click');
    await flushPromises();

    expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      payload: {
        blocking_message: 'Updated block message',
      },
    });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('emits update:modelValue false when Cancel is clicked', async () => {
    await createWrapper();

    await findCancel().trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('closes the drawer when fetch fails', async () => {
    nexusaiAPI.router.guardrails_config.read.mockRejectedValue(
      new Error('failed'),
    );
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    wrapper = mount(SafetyGuardrailsDrawer, {
      props: { modelValue: true },
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            stubActions: false,
          }),
        ],
        stubs: {
          UnnnicDrawerNext: false,
          SafetyGuardrailsTopicList: true,
          SafetyGuardrailsBlockMessage: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    consoleError.mockRestore();
  });
});
