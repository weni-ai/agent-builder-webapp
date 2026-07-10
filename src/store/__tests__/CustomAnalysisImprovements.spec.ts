import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useCustomAnalysisImprovementsStore } from '@/store/CustomAnalysisImprovements';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      supervisor: {
        improvements: {
          customAnalysis: {
            list: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
          },
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
  })),
}));

const I18N_PREFIX = 'audit.improvements.custom_analysis_modal';

const buildListItem = (overrides = {}) => ({
  uuid: 'custom-analysis-uuid-1',
  title: 'Unrealistic delivery deadlines',
  conversationsCount: 5,
  ...overrides,
});

const buildDetail = (overrides = {}) => ({
  uuid: 'custom-analysis-uuid-2',
  title: 'Unrealistic delivery deadlines',
  definition: 'The agent is providing unrealistic delivery deadlines',
  exclusions: '',
  slug: 'unrealistic-delivery-deadlines',
  ...overrides,
});

describe('CustomAnalysisImprovements Store', () => {
  let store;
  let customAnalysisApi;
  let alertStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCustomAnalysisImprovementsStore();
    alertStore = useAlertStore();
    vi.spyOn(alertStore, 'add');
    customAnalysisApi =
      nexusaiAPI.agent_builder.supervisor.improvements.customAnalysis;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCustomAnalysis', () => {
    it('loads custom analysis list and sets complete status', async () => {
      customAnalysisApi.list.mockResolvedValue([buildListItem()]);

      await store.fetchCustomAnalysis();

      expect(customAnalysisApi.list).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
      expect(store.customAnalysis.data).toEqual([buildListItem()]);
      expect(store.customAnalysis.status).toBe('complete');
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('sets error status when list request fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      customAnalysisApi.list.mockRejectedValue(new Error('API Error'));

      await store.fetchCustomAnalysis();

      expect(store.customAnalysis.status).toBe('error');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('submitCustomAnalysis', () => {
    const submitPayload = {
      title: 'Unrealistic delivery deadlines',
      definition: 'The agent is providing unrealistic delivery deadlines',
    };

    it('creates custom analysis, prepends it to the list, and shows success alert', async () => {
      customAnalysisApi.create.mockResolvedValue(buildDetail());

      const result = await store.submitCustomAnalysis(submitPayload);

      expect(customAnalysisApi.create).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        title: submitPayload.title,
        definition: submitPayload.definition,
        exclusions: '',
      });
      expect(store.customAnalysis.data).toEqual([
        {
          uuid: 'custom-analysis-uuid-2',
          title: 'Unrealistic delivery deadlines',
          conversationsCount: 0,
        },
      ]);
      expect(store.createCustomAnalysis.status).toBe('complete');
      expect(result).toEqual({ status: 'complete' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(`${I18N_PREFIX}.create.success.title`),
        description: i18n.global.t(`${I18N_PREFIX}.create.success.description`),
      });
    });

    it('returns error without calling API when the custom analysis limit is reached', async () => {
      store.customAnalysis.data = Array.from({ length: 10 }, (_, index) =>
        buildListItem({
          uuid: `custom-analysis-uuid-${index + 1}`,
          title: `Custom analysis ${index + 1}`,
        }),
      );

      const result = await store.submitCustomAnalysis(submitPayload);

      expect(customAnalysisApi.create).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'error' });
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('shows generic error alert when create request fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      customAnalysisApi.create.mockRejectedValue(new Error('API Error'));

      const result = await store.submitCustomAnalysis(submitPayload);

      expect(store.createCustomAnalysis.status).toBe('error');
      expect(result).toEqual({ status: 'error' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t(`${I18N_PREFIX}.create.error`),
      });

      consoleErrorSpy.mockRestore();
    });

    it('shows limit error alert when create request returns 400', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      customAnalysisApi.create.mockRejectedValue({
        response: { status: 400 },
      });

      await store.submitCustomAnalysis(submitPayload);

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t(`${I18N_PREFIX}.create.limit_error`),
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('submitDeleteCustomAnalysis', () => {
    it('deletes custom analysis, removes it from the list, and shows informational alert', async () => {
      store.customAnalysis.data = [
        buildListItem(),
        buildListItem({
          uuid: 'custom-analysis-uuid-2',
          title: 'Another custom analysis',
        }),
      ];
      customAnalysisApi.delete.mockResolvedValue(undefined);

      const result = await store.submitDeleteCustomAnalysis(
        'custom-analysis-uuid-1',
      );

      expect(customAnalysisApi.delete).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        customAnalysisUuid: 'custom-analysis-uuid-1',
      });
      expect(store.customAnalysis.data).toEqual([
        buildListItem({
          uuid: 'custom-analysis-uuid-2',
          title: 'Another custom analysis',
        }),
      ]);
      expect(store.deleteCustomAnalysis.status).toBe('complete');
      expect(store.deleteCustomAnalysis.customAnalysisUuid).toBeNull();
      expect(result).toEqual({ status: 'complete' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'informational',
        text: i18n.global.t(`${I18N_PREFIX}.delete.success.title`),
        description: i18n.global.t(`${I18N_PREFIX}.delete.success.description`),
      });
    });

    it('shows error alert when delete request fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      customAnalysisApi.delete.mockRejectedValue(new Error('API Error'));

      const result = await store.submitDeleteCustomAnalysis(
        'custom-analysis-uuid-1',
      );

      expect(store.deleteCustomAnalysis.status).toBe('error');
      expect(store.deleteCustomAnalysis.customAnalysisUuid).toBeNull();
      expect(result).toEqual({ status: 'error' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t(`${I18N_PREFIX}.delete.error`),
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
