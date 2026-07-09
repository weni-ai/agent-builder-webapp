import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';

import ImprovementStatusDialog from '../ImprovementStatusDialog.vue';

describe('ImprovementStatusDialog.vue', () => {
  let wrapper;
  let improvementsStore;

  const createWrapper = (props = {}) => {
    wrapper = mount(ImprovementStatusDialog, {
      props: {
        open: true,
        status: 'ignored',
        improvementUuid: 'improvement-uuid-1',
        ...props,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        stubs: {
          UnnnicDialogClose: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    improvementsStore = useImprovementsStore();
  };

  const elements = {
    title: (status) =>
      wrapper.find(`[data-testid="improvement-status-dialog-${status}-title"]`),
    description: (status) =>
      wrapper.find(
        `[data-testid="improvement-status-dialog-${status}-description"]`,
      ),
    cancelButton: (status) =>
      wrapper.findComponent(
        `[data-testid="improvement-status-dialog-${status}-cancel"]`,
      ),
    confirmButton: (status) =>
      wrapper.findComponent(
        `[data-testid="improvement-status-dialog-${status}-confirm"]`,
      ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('ignored dialog', () => {
    it('renders title and description', () => {
      createWrapper({ status: 'ignored' });

      expect(elements.title('ignored').text()).toBe(
        i18n.global.t('audit.improvements.status_dialog.ignored.title'),
      );
      expect(elements.description('ignored').text()).toBe(
        i18n.global.t('audit.improvements.status_dialog.ignored.description'),
      );
    });

    it('renders cancel and confirm buttons', () => {
      createWrapper({ status: 'ignored' });

      const cancelButton = elements.cancelButton('ignored');
      const confirmButton = elements.confirmButton('ignored');

      expect(cancelButton.props('type')).toBe('tertiary');
      expect(cancelButton.props('text')).toBe(
        i18n.global.t('audit.improvements.status_dialog.cancel'),
      );
      expect(confirmButton.props('type')).toBe('primary');
      expect(confirmButton.props('text')).toBe(
        i18n.global.t('audit.improvements.drawer.ignore_improvement'),
      );
    });
  });

  describe('resolved dialog', () => {
    it('renders title and description', () => {
      createWrapper({ status: 'resolved' });

      expect(elements.title('resolved').text()).toBe(
        i18n.global.t('audit.improvements.status_dialog.resolved.title'),
      );
      expect(elements.description('resolved').text()).toBe(
        i18n.global.t('audit.improvements.status_dialog.resolved.description'),
      );
    });

    it('renders confirm button with mark as resolved label', () => {
      createWrapper({ status: 'resolved' });

      expect(elements.confirmButton('resolved').props('text')).toBe(
        i18n.global.t('audit.improvements.drawer.mark_as_resolved'),
      );
    });
  });

  describe('actions', () => {
    it('calls updateImprovementStatus and emits success on confirm', async () => {
      createWrapper({ status: 'ignored' });
      improvementsStore.updateImprovementStatus = vi
        .fn()
        .mockResolvedValue({ status: 'complete' });

      await elements.confirmButton('ignored').trigger('click');
      await flushPromises();

      expect(improvementsStore.updateImprovementStatus).toHaveBeenCalledWith(
        'improvement-uuid-1',
        'ignored',
      );
      expect(wrapper.emitted('success')).toHaveLength(1);
      expect(wrapper.emitted('update:open')).toEqual([[false]]);
    });

    it('does not emit success when updateImprovementStatus fails', async () => {
      createWrapper({ status: 'resolved' });
      improvementsStore.updateImprovementStatus = vi
        .fn()
        .mockResolvedValue({ status: 'error' });

      await elements.confirmButton('resolved').trigger('click');
      await flushPromises();

      expect(wrapper.emitted('success')).toBeUndefined();
      expect(wrapper.emitted('update:open')).toBeUndefined();
    });

    it('closes the dialog when cancel is clicked', async () => {
      createWrapper();

      await elements.cancelButton('ignored').trigger('click');

      expect(wrapper.emitted('update:open')).toEqual([[false]]);
    });
  });
});
