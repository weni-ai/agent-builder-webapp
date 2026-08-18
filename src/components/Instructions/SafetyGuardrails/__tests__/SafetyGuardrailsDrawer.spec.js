import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import SafetyGuardrailsDrawer from '../SafetyGuardrailsDrawer.vue';
import SafetyGuardrailsTopicList from '../SafetyGuardrailsTopicList.vue';
import SafetyGuardrailsBlockMessage from '../SafetyGuardrailsBlockMessage.vue';
import SafetyGuardrailsAllowTopicsDialog from '../SafetyGuardrailsAllowTopicsDialog.vue';
import SafetyGuardrailsManipulationAttempts from '../SafetyGuardrailsManipulationAttempts.vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      guardrails_config: {
        read: vi.fn(),
        update: vi.fn(),
      },
      prompt_injection_filter: {
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

const filterConfig = {
  enabled: true,
};

const drawerStubs = {
  UnnnicDrawerNext: false,
  SafetyGuardrailsTopicList: true,
  SafetyGuardrailsBlockMessage: true,
  SafetyGuardrailsAllowTopicsDialog: true,
  SafetyGuardrailsManipulationAttempts: true,
};

describe('SafetyGuardrailsDrawer.vue', () => {
  let wrapper;

  const createWrapper = async (props = {}) => {
    nexusaiAPI.router.guardrails_config.read.mockResolvedValue(storeConfig);
    nexusaiAPI.router.prompt_injection_filter.read.mockResolvedValue(
      filterConfig,
    );

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
        stubs: drawerStubs,
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
  const findManipulationAttempts = () =>
    wrapper.findComponent(SafetyGuardrailsManipulationAttempts);
  const findAllowTopicsDialog = () =>
    wrapper.findComponent(SafetyGuardrailsAllowTopicsDialog);
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

  afterEach(async () => {
    wrapper?.unmount();
    wrapper = undefined;
    await flushPromises();
    vi.useFakeTimers();
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('renders drawer title, description, topics, and block message from the store', async () => {
    await createWrapper();

    expect(findTitle().text()).toBe(
      i18n.global.t('agents.instructions.safety_guardrails.drawer.title'),
    );

    const descriptionText = findDescription().text();
    expect(descriptionText).toContain(
      i18n.global.t(
        'agents.instructions.safety_guardrails.drawer.description.intro',
      ),
    );
    expect(descriptionText).toContain(
      i18n.global.t(
        'agents.instructions.safety_guardrails.drawer.description.on',
      ),
    );
    expect(descriptionText).toContain(
      i18n.global.t(
        'agents.instructions.safety_guardrails.drawer.description.off',
      ),
    );

    expect(nexusaiAPI.router.guardrails_config.read).toHaveBeenCalled();
    expect(nexusaiAPI.router.prompt_injection_filter.read).toHaveBeenCalled();
    expect(findTopicList().props('topics')).toEqual(storeConfig.topics);
    expect(findTopicList().props('loading')).toBe(false);
    expect(findBlockMessage().props('modelValue')).toBe(
      storeConfig.blockingMessage,
    );
    expect(findBlockMessage().props('maxLength')).toBe(250);
    expect(findManipulationAttempts().props('modelValue')).toBe(true);
  });

  it('passes loading true to the topic list while fetching', async () => {
    let resolveFetch;
    let resolveFilter;
    nexusaiAPI.router.guardrails_config.read.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    nexusaiAPI.router.prompt_injection_filter.read.mockReturnValue(
      new Promise((resolve) => {
        resolveFilter = resolve;
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
        stubs: drawerStubs,
      },
    });

    await nextTick();

    expect(findTopicList().props('loading')).toBe(true);
    expect(findDescriptionSkeleton().exists()).toBe(true);
    expect(findBlockMessage().exists()).toBe(false);
    expect(findManipulationAttempts().exists()).toBe(false);

    resolveFetch(storeConfig);
    resolveFilter(filterConfig);
    await flushPromises();

    expect(findTopicList().props('loading')).toBe(false);
    expect(findDescriptionSkeleton().exists()).toBe(false);
    expect(findBlockMessage().exists()).toBe(true);
    expect(findManipulationAttempts().exists()).toBe(true);
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

  it('enables Save when the prompt injection switch changes', async () => {
    await createWrapper();

    expect(findSave().props('disabled')).toBe(true);

    findManipulationAttempts().vm.$emit('update:modelValue', false);
    await nextTick();

    expect(findSave().props('disabled')).toBe(false);
  });

  it('opens confirm dialog when saving with unblocked topics', async () => {
    await createWrapper();

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    await nextTick();

    await findSave().trigger('click');
    await nextTick();

    expect(nexusaiAPI.router.guardrails_config.update).not.toHaveBeenCalled();
    expect(findAllowTopicsDialog().props('open')).toBe(true);
    expect(findAllowTopicsDialog().props('topicNames')).toEqual(['Politics']);
    expect(findAllowTopicsDialog().props('promptInjectionOnly')).toBe(false);
  });

  it('opens confirm dialog listing Prompt injection when it is turned off', async () => {
    await createWrapper();

    findManipulationAttempts().vm.$emit('update:modelValue', false);
    await nextTick();

    await findSave().trigger('click');
    await nextTick();

    expect(
      nexusaiAPI.router.prompt_injection_filter.update,
    ).not.toHaveBeenCalled();
    expect(findAllowTopicsDialog().props('open')).toBe(true);
    expect(findAllowTopicsDialog().props('topicNames')).toEqual([
      'Prompt injection',
    ]);
    expect(findAllowTopicsDialog().props('promptInjectionOnly')).toBe(true);
  });

  it('sets promptInjectionOnly false when a topic is also unblocked', async () => {
    await createWrapper();

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    findManipulationAttempts().vm.$emit('update:modelValue', false);
    await nextTick();

    await findSave().trigger('click');
    await nextTick();

    expect(findAllowTopicsDialog().props('open')).toBe(true);
    expect(findAllowTopicsDialog().props('topicNames')).toEqual([
      'Politics',
      'Prompt injection',
    ]);
    expect(findAllowTopicsDialog().props('promptInjectionOnly')).toBe(false);
  });

  it('saves after confirming allow topics dialog', async () => {
    await createWrapper();
    nexusaiAPI.router.guardrails_config.update.mockResolvedValue(storeConfig);

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'politics',
      enabled: false,
    });
    await nextTick();

    await findSave().trigger('click');
    await nextTick();

    findAllowTopicsDialog().vm.$emit('confirm');
    await flushPromises();

    expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      data: {
        categoryStates: { politics: false },
      },
    });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('saves blocked topics without confirmation', async () => {
    await createWrapper();
    nexusaiAPI.router.guardrails_config.update.mockResolvedValue(storeConfig);

    findTopicList().vm.$emit('update:topic-enabled', {
      id: 'hate',
      enabled: true,
    });
    await nextTick();

    await findSave().trigger('click');
    await flushPromises();

    expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      data: {
        categoryStates: { hate: true },
      },
    });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('saves changed block message and closes the drawer', async () => {
    await createWrapper();
    nexusaiAPI.router.guardrails_config.update.mockResolvedValue({
      ...storeConfig,
      blockingMessage: 'Updated block message',
    });

    findBlockMessage().vm.$emit('update:modelValue', 'Updated block message');
    await nextTick();

    await findSave().trigger('click');
    await flushPromises();

    expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      data: {
        blockingMessage: 'Updated block message',
      },
    });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('saves promptInjectionEnabled in the PATCH payload', async () => {
    await createWrapper();
    nexusaiAPI.router.prompt_injection_filter.update.mockResolvedValue({
      enabled: false,
    });

    findManipulationAttempts().vm.$emit('update:modelValue', false);
    await nextTick();

    await findSave().trigger('click');
    await nextTick();

    findAllowTopicsDialog().vm.$emit('confirm');
    await flushPromises();

    expect(
      nexusaiAPI.router.prompt_injection_filter.update,
    ).toHaveBeenCalledWith({
      projectUuid: 'project-uuid',
      data: { enabled: false },
    });
    expect(nexusaiAPI.router.guardrails_config.update).not.toHaveBeenCalled();
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
    nexusaiAPI.router.prompt_injection_filter.read.mockResolvedValue(
      filterConfig,
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
        stubs: drawerStubs,
      },
    });

    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    consoleError.mockRestore();
  });
});
