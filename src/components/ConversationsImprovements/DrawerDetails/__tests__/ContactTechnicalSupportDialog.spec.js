import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';

import ContactTechnicalSupportDialog from '../ContactTechnicalSupportDialog.vue';

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
  })),
}));

vi.mock('@/store/User', () => ({
  useUserStore: vi.fn(() => ({
    user: {
      email: 'user@example.com',
    },
  })),
}));

describe('ContactTechnicalSupportDialog.vue', () => {
  let wrapper;
  let improvementsStore;

  const technicalIssueDetail = {
    uuid: 'improvement-uuid-1',
    text: 'Poor product search results are affecting customer experience.',
    type: 'poor_product_search_results',
    description: 'Search results are not relevant.',
    suggestedSolution: 'Contact technical support to review the search index.',
    status: 'pending',
    affectedInstructions: [],
  };

  const technicalIssueTypeLabel = i18n.global.t(
    'audit.improvements.types.technical_issue',
  );

  const defaultProps = {
    open: true,
    improvementUuid: 'improvement-uuid-1',
    improvementTitle: technicalIssueDetail.text,
    conversationsCount: 12,
    improvementTypeLabel: technicalIssueTypeLabel,
    identifiedAt: '2026-06-01T10:00:00Z',
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(ContactTechnicalSupportDialog, {
      props: {
        ...defaultProps,
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
    title: () =>
      wrapper.find('[data-testid="contact-technical-support-dialog-title"]'),
    description: () =>
      wrapper.find(
        '[data-testid="contact-technical-support-dialog-description"]',
      ),
    infoBox: () =>
      wrapper.find('[data-testid="contact-technical-support-dialog-info-box"]'),
    infoTitle: () =>
      wrapper.find(
        '[data-testid="contact-technical-support-dialog-info-title"]',
      ),
    infoSummary: () =>
      wrapper.find(
        '[data-testid="contact-technical-support-dialog-info-summary"]',
      ),
    infoIdentifiedOn: () =>
      wrapper.find(
        '[data-testid="contact-technical-support-dialog-info-identified-on"]',
      ),
    infoProjectUuid: () =>
      wrapper.find(
        '[data-testid="contact-technical-support-dialog-info-project-uuid"]',
      ),
    cancelButton: () =>
      wrapper.findComponent(
        '[data-testid="contact-technical-support-dialog-cancel"]',
      ),
    confirmButton: () =>
      wrapper.findComponent(
        '[data-testid="contact-technical-support-dialog-confirm"]',
      ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders title and description', () => {
    createWrapper();

    expect(elements.title().text()).toBe(
      i18n.global.t(
        'audit.improvements.contact_technical_support_dialog.title',
      ),
    );
    expect(elements.description().text()).toBe(
      i18n.global.t(
        'audit.improvements.contact_technical_support_dialog.description',
        {
          support_email: 'support.weni@vtex.com',
        },
      ),
    );
  });

  it('renders the preview box with improvement details', () => {
    createWrapper();

    expect(elements.infoBox().exists()).toBe(true);
    expect(elements.infoTitle().text()).toBe(technicalIssueDetail.text);
    expect(elements.infoSummary().text()).toBe(
      i18n.global.t(
        'audit.improvements.contact_technical_support_dialog.summary_type_and_count',
        {
          type: technicalIssueTypeLabel,
          count: 12,
        },
      ),
    );
    expect(elements.infoIdentifiedOn().text()).toContain('user@example.com');
    expect(elements.infoProjectUuid().text()).toBe(
      i18n.global.t(
        'audit.improvements.contact_technical_support_dialog.project_uuid',
        {
          uuid: 'test-project-uuid',
        },
      ),
    );
  });

  it('closes the dialog when cancel is clicked', async () => {
    createWrapper();

    await elements.cancelButton().trigger('click');

    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('calls contactTechnicalSupport and closes the dialog on success', async () => {
    createWrapper();
    improvementsStore.contactTechnicalSupport = vi
      .fn()
      .mockResolvedValue({ status: 'complete' });

    await elements.confirmButton().trigger('click');
    await flushPromises();

    expect(improvementsStore.contactTechnicalSupport).toHaveBeenCalledWith(
      'improvement-uuid-1',
    );
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('does not close the dialog when contactTechnicalSupport fails', async () => {
    createWrapper();
    improvementsStore.contactTechnicalSupport = vi
      .fn()
      .mockResolvedValue({ status: 'error' });

    await elements.confirmButton().trigger('click');
    await flushPromises();

    expect(wrapper.emitted('update:open')).toBeUndefined();
  });

  it('disables cancel while submitting', async () => {
    createWrapper();
    let resolveContactSupport;
    improvementsStore.contactTechnicalSupport = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveContactSupport = resolve;
        }),
    );

    await elements.confirmButton().trigger('click');
    await flushPromises();

    expect(elements.cancelButton().props('disabled')).toBe(true);

    resolveContactSupport({ status: 'complete' });
    await flushPromises();
  });
});
