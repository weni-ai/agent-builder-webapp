import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import i18n from '@/utils/plugins/i18n';

import ImprovementsList from '../ImprovementsList.vue';
import ImprovementDrawer from '../DrawerDetails/ImprovementDrawer.vue';
import ImprovementRow from '../ImprovementRow.vue';

describe('ImprovementsList.vue', () => {
  let wrapper;

  const mockImprovements = [
    {
      uuid: 'improvement-uuid-1',
      text: 'The agent tone does not match the configured brand voice in refund conversations.',
      type: 'personality_deviation',
      conversationsCount: 12,
    },
    {
      uuid: 'improvement-uuid-2',
      text: 'The agent asks too many questions before providing an answer about order status.',
      type: 'many_questions_before_answering',
      conversationsCount: 18,
    },
  ];

  const sortedMockImprovements = [...mockImprovements].sort(
    (a, b) => b.conversationsCount - a.conversationsCount,
  );

  const createWrapper = (stateOverrides = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        Improvements: {
          improvements: {
            data: mockImprovements,
            status: 'complete',
            ...(stateOverrides.improvements || {}),
          },
        },
      },
    });

    wrapper = mount(ImprovementsList, {
      global: {
        plugins: [pinia],
        stubs: {
          ImprovementDrawer: true,
          UnnnicTable: {
            template: '<table><slot /></table>',
          },
          UnnnicTableHeader: {
            template: '<thead><slot /></thead>',
          },
          UnnnicTableBody: {
            template: '<tbody><slot /></tbody>',
          },
          UnnnicTableRow: {
            template: '<tr><slot /></tr>',
          },
          UnnnicTableHead: {
            template: '<th><slot /></th>',
          },
        },
      },
    });

    return wrapper;
  };

  const elements = {
    list: () => wrapper.find('[data-testid="improvements-list"]'),
    columnHead: (column) =>
      wrapper.find(`[data-testid="improvement-table-head-${column}"]`),
    rows: () => wrapper.findAllComponents(ImprovementRow),
    drawer: () => wrapper.findComponent(ImprovementDrawer),
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the improvements list section', () => {
      expect(elements.list().exists()).toBe(true);
    });

    it('renders the table column headers', () => {
      expect(elements.columnHead('improvement').text()).toBe(
        i18n.global.t('audit.improvements.columns.improvement'),
      );
      expect(elements.columnHead('type').text()).toBe(
        i18n.global.t('audit.improvements.columns.type'),
      );
      expect(elements.columnHead('affected_conversations').text()).toBe(
        i18n.global.t('audit.improvements.columns.affected_conversations'),
      );
    });

    it('renders one row per improvement from the store', () => {
      const rows = elements.rows();

      expect(rows).toHaveLength(mockImprovements.length);
      expect(rows[0].props('improvement')).toEqual(sortedMockImprovements[0]);
      expect(rows[1].props('improvement')).toEqual(sortedMockImprovements[1]);
    });

    it('sorts improvements by conversationsCount in descending order', () => {
      const rows = elements.rows();

      expect(rows[0].props('improvement').conversationsCount).toBe(18);
      expect(rows[1].props('improvement').conversationsCount).toBe(12);
      expect(rows[0].props('improvement').uuid).toBe('improvement-uuid-2');
      expect(rows[1].props('improvement').uuid).toBe('improvement-uuid-1');
    });

    it('does not apply the selected modifier class initially', () => {
      expect(elements.list().classes()).not.toContain(
        'improvements-list--selected',
      );
    });

    it('renders the improvement drawer closed initially', () => {
      expect(elements.drawer().props('open')).toBe(false);
      expect(elements.drawer().props('improvement')).toBeNull();
    });
  });

  describe('Row interaction', () => {
    it('opens the drawer with the selected improvement when a row is clicked', async () => {
      await elements.rows()[0].trigger('click');
      await nextTick();

      expect(elements.drawer().props('open')).toBe(true);
      expect(elements.drawer().props('improvement')).toEqual(
        sortedMockImprovements[0],
      );
    });

    it('marks the clicked row as selected', async () => {
      await elements.rows()[0].trigger('click');
      await nextTick();

      expect(elements.rows()[0].props('isSelected')).toBe(true);
      expect(elements.rows()[1].props('isSelected')).toBe(false);
      expect(elements.list().classes()).toContain(
        'improvements-list--selected',
      );
    });

    it('clears the selection when the drawer is closed', async () => {
      vi.useFakeTimers();

      await elements.rows()[0].trigger('click');
      await nextTick();

      await elements.drawer().setValue(false, 'open');
      await nextTick();

      vi.advanceTimersByTime(300);
      await nextTick();

      expect(elements.drawer().props('open')).toBe(false);
      expect(elements.drawer().props('improvement')).toBeNull();
      expect(elements.rows()[0].props('isSelected')).toBe(false);
      expect(elements.list().classes()).not.toContain(
        'improvements-list--selected',
      );

      vi.useRealTimers();
    });
  });
});
