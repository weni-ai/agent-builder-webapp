import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import WebchatPreview from '../WebchatPreview.vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useWebchatPreviewStore } from '@/store/WebchatPreview';
import i18n from '@/utils/plugins/i18n';

const mockPreload = vi.fn().mockResolvedValue(undefined);
const mockCleanup = vi.fn();

vi.mock('@/composables/webchat/useWebchatLoader', () => ({
  useWebchatLoader: () => ({
    preload: mockPreload,
    cleanup: mockCleanup,
  }),
}));

const mockPatch = vi.fn();
const mockRestore = vi.fn();

vi.mock('@/composables/webchat/useWebSocketHistoryPatch', () => ({
  useWebSocketHistoryPatch: () => ({
    patch: mockPatch,
    restore: mockRestore,
  }),
}));

vi.mock('@/utils/env', () => ({
  default: (key) => `mock-${key}`,
}));

Element.prototype.scrollIntoView = vi.fn();

describe('WebchatPreview.vue', () => {
  let wrapper;
  let _flowPreviewStore;
  let managerSelectorStore;
  let webchatPreviewStore;

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
      initialState: {
        Project: {
          uuid: 'test-uuid',
          project: { wwcChannelUuid: 'test-channel-uuid' },
        },
        flowPreview: {
          preview: { contact: { uuid: 'c-uuid', urn: 'test-urn' } },
          messages: [],
        },
        ManagerSelector: {
          selectedPreviewManager: '',
          options: {
            currentManager: '',
            serverTime: '',
            managers: {
              new: { id: 'new-manager', label: 'New Manager' },
              legacy: { id: 'legacy-manager', label: 'Legacy Manager' },
            },
          },
        },
      },
    });

    _flowPreviewStore = useFlowPreviewStore(pinia);
    managerSelectorStore = useManagerSelectorStore(pinia);
    webchatPreviewStore = useWebchatPreviewStore(pinia);

    vi.spyOn(webchatPreviewStore, 'changeManagerModel').mockResolvedValue();

    wrapper = mount(WebchatPreview, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    window.WebChat = { init: vi.fn() };
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
    delete window.WebChat;
  });

  const findContainer = () => wrapper.find('[data-testid="webchat-preview"]');

  it('should render the webchat container', () => {
    expect(findContainer().exists()).toBe(true);
  });

  it('should call preload and WebChat.init on mount', async () => {
    await vi.waitFor(() => {
      expect(mockPreload).toHaveBeenCalled();
    });

    expect(window.WebChat.init).toHaveBeenCalledWith(
      expect.objectContaining({
        selector: '#weni-webchat-preview',
        socketUrl: 'mock-WWC_SOCKET_URL',
        host: 'mock-WWC_HOST_URL',
        channelUuid: 'test-channel-uuid',
        sessionId: 'test-urn',
        inputTextFieldHint: i18n.global.t(
          'router.preview.preview_tests_placeholder',
        ),
        embedded: true,
        showChatAvatar: false,
        showCameraButton: false,
      }),
    );
  });

  it('should call cleanup on unmount', () => {
    wrapper.unmount();

    expect(mockRestore).toHaveBeenCalled();
    expect(mockCleanup).toHaveBeenCalled();
  });

  describe('manager change watcher', () => {
    it('should call changeManagerModel when selectedPreviewManager changes', async () => {
      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();

      expect(webchatPreviewStore.changeManagerModel).toHaveBeenCalledWith(
        'new-manager',
      );
    });

    it('should not call changeManagerModel when managerId is empty', async () => {
      managerSelectorStore.selectedPreviewManager = '';
      await nextTick();

      expect(webchatPreviewStore.changeManagerModel).not.toHaveBeenCalled();
    });

    it('should not call changeManagerModel when managerId is the same', async () => {
      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();
      vi.clearAllMocks();

      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();

      expect(webchatPreviewStore.changeManagerModel).not.toHaveBeenCalled();
    });
  });

  describe('injectManagerSelectedMessage', () => {
    function createMessagesContainer() {
      const container = document.createElement('div');
      container.id = 'weni-webchat-preview';

      const messagesList = document.createElement('div');
      messagesList.className = 'weni-messages-list';
      container.appendChild(messagesList);

      document.body.appendChild(container);
      return messagesList;
    }

    function addDirectionGroup(messagesList) {
      const group = document.createElement('div');
      group.className = 'weni-messages-list__direction-group';
      messagesList.appendChild(group);
      return group;
    }

    afterEach(() => {
      const existing = document.getElementById('weni-webchat-preview');
      if (existing) existing.remove();
    });

    it('should inject status element after the last direction group', async () => {
      const messagesList = createMessagesContainer();
      addDirectionGroup(messagesList);

      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();

      const statusEl = messagesList.querySelector('.webchat-manager-status');
      expect(statusEl).not.toBeNull();
      expect(statusEl.textContent).toContain('New Manager');
    });

    it('should append to container when there are no direction groups', async () => {
      const messagesList = createMessagesContainer();

      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();

      const statusEl = messagesList.querySelector('.webchat-manager-status');
      expect(statusEl).not.toBeNull();
      expect(messagesList.lastChild).toBe(statusEl);
    });

    it('should insert consecutive status elements in chronological order', async () => {
      const messagesList = createMessagesContainer();
      addDirectionGroup(messagesList);

      managerSelectorStore.selectedPreviewManager = 'new-manager';
      await nextTick();

      managerSelectorStore.selectedPreviewManager = 'legacy-manager';
      await nextTick();

      const statusElements = messagesList.querySelectorAll(
        '.webchat-manager-status',
      );
      expect(statusElements).toHaveLength(2);
      expect(statusElements[0].textContent).toContain('New Manager');
      expect(statusElements[1].textContent).toContain('Legacy Manager');
    });
  });

  describe('placeholder', () => {
    function createMessagesContainer() {
      const container = document.createElement('div');
      container.id = 'weni-webchat-preview';

      const messagesList = document.createElement('div');
      messagesList.className = 'weni-messages-list';
      container.appendChild(messagesList);

      document.body.appendChild(container);
      return messagesList;
    }

    function triggerWebchatReady() {
      const onReady = mockPatch.mock.calls[0]?.[0];
      onReady?.();
    }

    afterEach(() => {
      const existing = document.getElementById('weni-webchat-preview');
      if (existing) existing.remove();
    });

    it('should show the placeholder text when webchat becomes ready and there are no messages', async () => {
      const messagesList = createMessagesContainer();

      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled());
      triggerWebchatReady();
      await nextTick();

      const placeholder = messagesList.querySelector('.webchat-placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder.tagName).toBe('P');
      expect(placeholder.textContent).toBe(
        i18n.global.t('router.preview.placeholder'),
      );
    });

    it('should not duplicate the placeholder if already shown', async () => {
      const messagesList = createMessagesContainer();

      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled());
      triggerWebchatReady();
      triggerWebchatReady();
      await nextTick();

      expect(
        messagesList.querySelectorAll('.webchat-placeholder'),
      ).toHaveLength(1);
    });

    it('should remove the placeholder when a direction group appears', async () => {
      const messagesList = createMessagesContainer();

      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled());
      triggerWebchatReady();
      await nextTick();

      expect(messagesList.querySelector('.webchat-placeholder')).not.toBeNull();

      const message = document.createElement('div');
      message.className = 'weni-message';
      messagesList.appendChild(message);

      await vi.waitFor(() => {
        expect(messagesList.querySelector('.webchat-placeholder')).toBeNull();
      });
    });

    it('should remove the placeholder on component unmount', async () => {
      const messagesList = createMessagesContainer();

      await vi.waitFor(() => expect(mockPatch).toHaveBeenCalled());
      triggerWebchatReady();
      await nextTick();

      expect(messagesList.querySelector('.webchat-placeholder')).not.toBeNull();

      wrapper.unmount();

      expect(messagesList.querySelector('.webchat-placeholder')).toBeNull();
    });
  });
});
