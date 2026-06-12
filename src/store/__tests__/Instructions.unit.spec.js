import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInstructionsStore } from '@/store/Instructions';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import { moduleStorage } from '@/utils/storage';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      instructions: {
        addInstruction: vi.fn(),
        list: vi.fn(),
        edit: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        listGrouped: vi.fn(),
        update: vi.fn(),
        deleteInstruction: vi.fn(),
        deleteCategory: vi.fn(),
        getSuggestionByAI: vi.fn(),
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

const featureFlagsState = { categorizationOfInstructions: false };

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({ flags: featureFlagsState }),
}));

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('Instructions Store', () => {
  let store;
  let alertStore;

  beforeEach(() => {
    featureFlagsState.categorizationOfInstructions = false;
    setActivePinia(createPinia());
    store = useInstructionsStore();
    alertStore = useAlertStore();

    vi.spyOn(alertStore, 'add').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state for instructions', () => {
      expect(store.instructions).toEqual({
        data: [],
        status: null,
      });
    });

    it('should have correct initial state for newInstruction', () => {
      expect(store.newInstruction).toEqual({
        text: '',
        category: null,
        status: null,
      });
    });

    it('should initialize validateInstructionByAI from storage', () => {
      moduleStorage.getItem.mockReturnValue(false);
      setActivePinia(createPinia());
      const newStore = useInstructionsStore();
      expect(newStore.validateInstructionByAI).toBe(false);
    });

    it('should default validateInstructionByAI to true if not in storage', () => {
      moduleStorage.getItem.mockReturnValue(null);
      setActivePinia(createPinia());
      const newStore = useInstructionsStore();
      expect(newStore.validateInstructionByAI).toBe(true);
    });

    it('should have activeInstructionsListTab set to custom', () => {
      expect(store.activeInstructionsListTab).toBe('custom');
    });
  });

  describe('Actions', () => {
    describe('addInstruction', () => {
      beforeEach(() => {
        store.newInstruction.text = 'New instruction text';
      });

      it('should add instruction successfully', async () => {
        const mockResponse = { id: 1 };
        nexusaiAPI.agent_builder.instructions.addInstruction.mockResolvedValue(
          mockResponse,
        );

        await store.addInstruction();

        expect(
          nexusaiAPI.agent_builder.instructions.addInstruction,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          instruction: store.newInstruction,
        });

        expect(store.instructions.data).toHaveLength(1);
        expect(store.instructions.data[0]).toEqual({
          text: 'New instruction text',
          category: null,
          status: 'complete',
          id: 1,
        });
        expect(store.newInstruction.text).toBe('');
        expect(store.newInstruction.status).toBeNull();
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.new_instruction.success_alert',
          ),
          description: '',
          type: 'success',
        });
      });

      it('should set activeInstructionsListTab to custom', async () => {
        nexusaiAPI.agent_builder.instructions.addInstruction.mockResolvedValue({
          id: 1,
        });

        await store.addInstruction();

        expect(store.activeInstructionsListTab).toBe('custom');
      });

      it('should set loading status while adding instruction', async () => {
        nexusaiAPI.agent_builder.instructions.addInstruction.mockImplementation(
          () => {
            expect(store.newInstruction.status).toBe('loading');
            return Promise.resolve({ id: 1 });
          },
        );

        await store.addInstruction();
      });

      it('should handle add instruction error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.addInstruction.mockRejectedValue(
          error,
        );

        await store.addInstruction();

        expect(store.newInstruction.status).toBe('error');
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.new_instruction.error_alert',
          ),
          description: '',
          type: 'error',
        });
        expect(store.instructions.data).toHaveLength(0);
      });

      it('should not clear newInstruction text on error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.addInstruction.mockRejectedValue(
          error,
        );

        await store.addInstruction();

        expect(store.newInstruction.text).toBe('New instruction text');
      });
    });

    describe('loadInstructions', () => {
      it('should load instructions successfully', async () => {
        const mockInstructions = [
          { id: 1, text: 'Instruction 1' },
          { id: 2, text: 'Instruction 2' },
        ];
        nexusaiAPI.agent_builder.instructions.list.mockResolvedValue(
          mockInstructions,
        );

        await store.loadInstructions();

        expect(nexusaiAPI.agent_builder.instructions.list).toHaveBeenCalledWith(
          {
            projectUuid: 'test-project-uuid',
          },
        );
        expect(store.instructions.data).toEqual(mockInstructions);
        expect(store.instructions.status).toBe('complete');
      });

      it('should set loading status while loading instructions', async () => {
        nexusaiAPI.agent_builder.instructions.list.mockImplementation(() => {
          expect(store.instructions.status).toBe('loading');
          return Promise.resolve([]);
        });

        await store.loadInstructions();
      });

      it('should handle load instructions error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.list.mockRejectedValue(error);

        await store.loadInstructions();

        expect(store.instructions.status).toBe('error');
      });

      it('should append to existing instructions data', async () => {
        store.instructions.data = [{ id: 1, text: 'Existing instruction' }];
        const mockInstructions = [{ id: 2, text: 'New instruction' }];
        nexusaiAPI.agent_builder.instructions.list.mockResolvedValue(
          mockInstructions,
        );

        await store.loadInstructions();

        expect(store.instructions.data).toHaveLength(2);
        expect(store.instructions.data[0]).toEqual({
          id: 1,
          text: 'Existing instruction',
        });
        expect(store.instructions.data[1]).toEqual({
          id: 2,
          text: 'New instruction',
        });
      });
    });

    describe('editInstruction', () => {
      beforeEach(() => {
        store.instructions.data = [
          { id: 1, text: 'Old text 1', status: 'complete' },
          { id: 2, text: 'Old text 2', status: 'complete' },
        ];
      });

      it('should edit instruction successfully', async () => {
        nexusaiAPI.agent_builder.instructions.edit.mockResolvedValue();

        const result = await store.editInstruction(1, 'Updated text');

        expect(nexusaiAPI.agent_builder.instructions.edit).toHaveBeenCalledWith(
          {
            projectUuid: 'test-project-uuid',
            id: 1,
            text: 'Updated text',
          },
        );
        expect(store.instructions.data[0].text).toBe('Updated text');
        expect(store.instructions.data[0].status).toBe('complete');
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.edit_instruction.success_alert',
          ),
          description: '',
          type: 'success',
        });
        expect(result).toEqual({ status: 'complete' });
      });

      it('should set loading status while editing instruction', async () => {
        nexusaiAPI.agent_builder.instructions.edit.mockImplementation(() => {
          expect(store.instructions.data[0].status).toBe('loading');
          return Promise.resolve();
        });

        await store.editInstruction(1, 'Updated text');
      });

      it('should handle edit instruction error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.edit.mockRejectedValue(error);

        const result = await store.editInstruction(1, 'Updated text');

        expect(store.instructions.data[0].status).toBe('error');
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.edit_instruction.error_alert',
          ),
          description: '',
          type: 'error',
        });
        expect(result).toEqual({ status: 'error' });
      });

      it('should not update text on error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.edit.mockRejectedValue(error);

        await store.editInstruction(1, 'Updated text');

        expect(store.instructions.data[0].text).toBe('Old text 1');
      });

      it('should return undefined if instruction not found', async () => {
        const result = await store.editInstruction(999, 'Updated text');

        expect(
          nexusaiAPI.agent_builder.instructions.edit,
        ).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it('should not modify other instructions', async () => {
        nexusaiAPI.agent_builder.instructions.edit.mockResolvedValue();

        await store.editInstruction(1, 'Updated text');

        expect(store.instructions.data[1].text).toBe('Old text 2');
        expect(store.instructions.data[1].status).toBe('complete');
      });
    });

    describe('removeInstruction', () => {
      beforeEach(() => {
        store.instructions.data = [
          { id: 1, text: 'Instruction 1', status: 'complete' },
          { id: 2, text: 'Instruction 2', status: 'complete' },
          { id: 3, text: 'Instruction 3', status: 'complete' },
        ];
      });

      it('should remove instruction successfully', async () => {
        nexusaiAPI.agent_builder.instructions.delete.mockResolvedValue();

        const result = await store.removeInstruction(2);

        expect(
          nexusaiAPI.agent_builder.instructions.delete,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          id: 2,
        });
        expect(store.instructions.data).toHaveLength(2);
        expect(store.instructions.data.find((i) => i.id === 2)).toBeUndefined();
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.remove_instruction.success_alert',
          ),
          description: '',
          type: 'informational',
        });
        expect(result).toEqual({ status: null });
      });

      it('should set loading status while removing instruction', async () => {
        nexusaiAPI.agent_builder.instructions.delete.mockImplementation(() => {
          const instruction = store.instructions.data.find((i) => i.id === 2);
          expect(instruction.status).toBe('loading');
          return Promise.resolve();
        });

        await store.removeInstruction(2);
      });

      it('should handle remove instruction error', async () => {
        const error = new Error('API Error');
        nexusaiAPI.agent_builder.instructions.delete.mockRejectedValue(error);

        const result = await store.removeInstruction(2);

        const instruction = store.instructions.data.find((i) => i.id === 2);
        expect(instruction.status).toBe('error');
        expect(store.instructions.data).toHaveLength(3);
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.remove_instruction.error_alert',
          ),
          description: i18n.global.t(
            'agent_builder.instructions.remove_instruction.error_alert_description',
          ),
          type: 'error',
        });
        expect(result).toEqual({ status: 'error' });
      });

      it('should return undefined if instruction not found', async () => {
        const result = await store.removeInstruction(999);

        expect(
          nexusaiAPI.agent_builder.instructions.delete,
        ).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
      });

      it('should not modify other instructions', async () => {
        nexusaiAPI.agent_builder.instructions.delete.mockResolvedValue();

        await store.removeInstruction(2);

        expect(store.instructions.data[0]).toEqual({
          id: 1,
          text: 'Instruction 1',
          status: 'complete',
        });
        expect(store.instructions.data[1]).toEqual({
          id: 3,
          text: 'Instruction 3',
          status: 'complete',
        });
      });
    });

    describe('deleteCategory', () => {
      beforeEach(() => {
        store.categories = [
          { id: 10, name: 'Sales' },
          { id: 20, name: 'Support' },
        ];
        store.instructions.data = [
          { id: 1, text: 'A', category: { id: 10, name: 'Sales' } },
          { id: 2, text: 'B', category: { id: 10, name: 'Sales' } },
          { id: 3, text: 'C', category: { id: 20, name: 'Support' } },
        ];
      });

      it('moves the category instructions to uncategorized and removes the category', async () => {
        nexusaiAPI.agent_builder.instructions.deleteCategory.mockResolvedValue();

        const result = await store.deleteCategory(10);

        expect(
          nexusaiAPI.agent_builder.instructions.deleteCategory,
        ).toHaveBeenCalledWith({ projectUuid: 'test-project-uuid', id: 10 });
        expect(
          store.instructions.data.find((i) => i.id === 1).category,
        ).toBeNull();
        expect(
          store.instructions.data.find((i) => i.id === 2).category,
        ).toBeNull();
        expect(
          store.instructions.data.find((i) => i.id === 3).category,
        ).toEqual({
          id: 20,
          name: 'Support',
        });
        expect(store.categories).toEqual([{ id: 20, name: 'Support' }]);
        expect(result).toEqual({ status: null });
      });

      it('shows a success toast with the moved instructions count', async () => {
        nexusaiAPI.agent_builder.instructions.deleteCategory.mockResolvedValue();

        await store.deleteCategory(10);

        expect(alertStore.add).toHaveBeenCalledWith({
          type: 'informational',
          text: i18n.global.t(
            'agents.instructions.delete_category.success_title',
          ),
          description: i18n.global.t(
            'agents.instructions.delete_category.success_description',
            { count: 2 },
          ),
        });
      });

      it('keeps state and shows an error toast on failure', async () => {
        nexusaiAPI.agent_builder.instructions.deleteCategory.mockRejectedValue(
          new Error('API Error'),
        );

        const result = await store.deleteCategory(10);

        expect(store.categories).toHaveLength(2);
        expect(
          store.instructions.data.find((i) => i.id === 1).category,
        ).toEqual({
          id: 10,
          name: 'Sales',
        });
        expect(alertStore.add).toHaveBeenCalledWith({
          type: 'error',
          text: i18n.global.t(
            'agents.instructions.delete_category.error_title',
          ),
          description: i18n.global.t(
            'agents.instructions.delete_category.error_description',
          ),
        });
        expect(result).toEqual({ status: 'error' });
      });
    });

    describe('updateValidateInstructionByAI', () => {
      it('should update validateInstructionByAI to true', () => {
        store.validateInstructionByAI = false;

        store.updateValidateInstructionByAI(true);

        expect(store.validateInstructionByAI).toBe(true);
        expect(moduleStorage.setItem).toHaveBeenCalledWith(
          'validateInstructionByAI',
          true,
        );
      });

      it('should update validateInstructionByAI to false', () => {
        store.validateInstructionByAI = true;

        store.updateValidateInstructionByAI(false);

        expect(store.validateInstructionByAI).toBe(false);
        expect(moduleStorage.setItem).toHaveBeenCalledWith(
          'validateInstructionByAI',
          false,
        );
      });

      it('should persist value in storage', () => {
        store.updateValidateInstructionByAI(true);

        expect(moduleStorage.setItem).toHaveBeenCalledWith(
          'validateInstructionByAI',
          true,
        );
      });
    });
  });

  describe('Computed Properties', () => {
    it('should compute projectUuid from project store', () => {
      expect(store.instructions).toBeDefined();
      expect(store.newInstruction).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should add and then edit instruction', async () => {
      nexusaiAPI.agent_builder.instructions.addInstruction.mockResolvedValue({
        id: 1,
      });
      nexusaiAPI.agent_builder.instructions.edit.mockResolvedValue();

      store.newInstruction.text = 'New instruction';
      await store.addInstruction();

      await store.editInstruction(1, 'Updated instruction');

      expect(store.instructions.data[0]).toEqual({
        text: 'Updated instruction',
        category: null,
        status: 'complete',
        id: 1,
      });
    });

    it('should add and then remove instruction', async () => {
      nexusaiAPI.agent_builder.instructions.addInstruction.mockResolvedValue({
        id: 1,
      });
      nexusaiAPI.agent_builder.instructions.delete.mockResolvedValue();

      store.newInstruction.text = 'New instruction';
      await store.addInstruction();

      await store.removeInstruction(1);

      expect(store.instructions.data).toHaveLength(0);
    });

    it('should load instructions and then edit one', async () => {
      const mockInstructions = [
        { id: 1, text: 'Instruction 1' },
        { id: 2, text: 'Instruction 2' },
      ];
      nexusaiAPI.agent_builder.instructions.list.mockResolvedValue(
        mockInstructions,
      );
      nexusaiAPI.agent_builder.instructions.edit.mockResolvedValue();

      await store.loadInstructions();
      await store.editInstruction(1, 'Updated instruction 1');

      expect(store.instructions.data[0].text).toBe('Updated instruction 1');
    });
  });

  describe('Categorization flag (V2) branch', () => {
    const groupedResponse = {
      instructions: [
        { id: 1, text: 'Instruction 1', category: { id: 10, name: 'Sales' } },
        { id: 2, text: 'Instruction 2', category: null },
      ],
      categories: [{ id: 10, name: 'Sales' }],
    };

    beforeEach(() => {
      featureFlagsState.categorizationOfInstructions = true;
    });

    describe('loadInstructions', () => {
      it('loads grouped instructions and categories, replacing existing data', async () => {
        store.instructions.data = [{ id: 99, text: 'Stale', category: null }];
        nexusaiAPI.agent_builder.instructions.listGrouped.mockResolvedValue(
          groupedResponse,
        );

        await store.loadInstructions();

        expect(
          nexusaiAPI.agent_builder.instructions.listGrouped,
        ).toHaveBeenCalledWith({ projectUuid: 'test-project-uuid' });
        expect(
          nexusaiAPI.agent_builder.instructions.list,
        ).not.toHaveBeenCalled();
        expect(store.instructions.data).toEqual(groupedResponse.instructions);
        expect(store.categories).toEqual(groupedResponse.categories);
        expect(store.instructions.status).toBe('complete');
      });
    });

    describe('addInstruction', () => {
      beforeEach(() => {
        store.newInstruction.text = 'New instruction text';
        nexusaiAPI.agent_builder.instructions.create.mockResolvedValue(
          groupedResponse,
        );
      });

      it('sends the category id when an existing category is selected', async () => {
        store.newInstruction.category = { id: 10, name: 'Sales' };

        await store.addInstruction();

        expect(
          nexusaiAPI.agent_builder.instructions.create,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          instruction: 'New instruction text',
          category: { id: 10 },
        });
        expect(store.instructions.data).toEqual(groupedResponse.instructions);
        expect(store.categories).toEqual(groupedResponse.categories);
        expect(store.newInstruction.text).toBe('');
        expect(store.newInstruction.category).toBeNull();
      });

      it('sends the category name when a new category is selected', async () => {
        store.newInstruction.category = { id: null, name: 'Marketing' };

        await store.addInstruction();

        expect(
          nexusaiAPI.agent_builder.instructions.create,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          instruction: 'New instruction text',
          category: { name: 'Marketing' },
        });
      });

      it('omits the category when none is selected', async () => {
        store.newInstruction.category = null;

        await store.addInstruction();

        expect(
          nexusaiAPI.agent_builder.instructions.create,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          instruction: 'New instruction text',
          category: undefined,
        });
      });

      it('sets error status when the create request fails', async () => {
        nexusaiAPI.agent_builder.instructions.create.mockRejectedValue(
          new Error('API Error'),
        );

        await store.addInstruction();

        expect(store.newInstruction.status).toBe('error');
      });
    });

    describe('removeInstruction', () => {
      beforeEach(() => {
        store.instructions.data = [
          { id: 1, text: 'Instruction 1', category: null },
          { id: 2, text: 'Instruction 2', category: null },
        ];
      });

      it('deletes a single instruction via the grouped endpoint', async () => {
        nexusaiAPI.agent_builder.instructions.deleteInstruction.mockResolvedValue();

        await store.removeInstruction(1);

        expect(
          nexusaiAPI.agent_builder.instructions.deleteInstruction,
        ).toHaveBeenCalledWith({ projectUuid: 'test-project-uuid', id: 1 });
        expect(
          nexusaiAPI.agent_builder.instructions.delete,
        ).not.toHaveBeenCalled();
        expect(store.instructions.data).toHaveLength(1);
        expect(store.instructions.data[0].id).toBe(2);
      });
    });

    describe('getInstructionSuggestionByAI default category selection', () => {
      it('attaches the existing category id when the suggestion matches a known category', async () => {
        store.categories = [{ id: 10, name: 'Sales' }];
        nexusaiAPI.agent_builder.instructions.getSuggestionByAI.mockResolvedValue(
          {
            classification: [],
            suggestion: '',
            suggestedCategory: 'Sales',
          },
        );

        await store.getInstructionSuggestionByAI('Some instruction');

        expect(store.newInstruction.category).toEqual({
          id: 10,
          name: 'Sales',
        });
      });

      it('defaults to a new category when the suggestion is unknown', async () => {
        store.categories = [{ id: 10, name: 'Sales' }];
        nexusaiAPI.agent_builder.instructions.getSuggestionByAI.mockResolvedValue(
          {
            classification: [],
            suggestion: '',
            suggestedCategory: 'Logistics',
          },
        );

        await store.getInstructionSuggestionByAI('Some instruction');

        expect(store.newInstruction.category).toEqual({
          id: null,
          name: 'Logistics',
        });
      });
    });
  });

  describe('Instruction drawer (create/edit)', () => {
    it('opens the drawer in create mode and resets the new instruction', () => {
      store.newInstruction.text = 'leftover';
      store.newInstruction.category = { id: 1, name: 'X' };

      store.openNewInstructionDrawer();

      expect(store.isInstructionDrawerOpen).toBe(true);
      expect(store.instructionDrawerMode).toBe('create');
      expect(store.editingInstructionId).toBeNull();
      expect(store.newInstruction.text).toBe('');
      expect(store.newInstruction.category).toBeNull();
    });

    it('opens the drawer in edit mode prefilled from the instruction', () => {
      store.instructions.data = [
        { id: 7, text: 'Be concise', category: { id: 3, name: 'Tone' } },
      ];

      store.startEditingInstruction({ id: 7 });

      expect(store.isInstructionDrawerOpen).toBe(true);
      expect(store.instructionDrawerMode).toBe('edit');
      expect(store.editingInstructionId).toBe(7);
      expect(store.newInstruction.text).toBe('Be concise');
      expect(store.newInstruction.category).toEqual({ id: 3, name: 'Tone' });
    });

    it('does not open the drawer for an unknown instruction', () => {
      store.instructions.data = [];

      store.startEditingInstruction({ id: 999 });

      expect(store.isInstructionDrawerOpen).toBe(false);
    });

    it('closes the drawer and resets state', () => {
      store.instructions.data = [{ id: 7, text: 'x', category: null }];
      store.startEditingInstruction({ id: 7 });

      store.closeInstructionDrawer();

      expect(store.isInstructionDrawerOpen).toBe(false);
      expect(store.instructionDrawerMode).toBe('create');
      expect(store.editingInstructionId).toBeNull();
      expect(store.newInstruction.text).toBe('');
    });

    it('updates the edited instruction (text + category) via the grouped update', async () => {
      store.instructions.data = [
        { id: 7, text: 'Old', category: { id: 3, name: 'Tone' } },
        { id: 8, text: 'Other', category: null },
      ];
      const updated = {
        instructions: [
          { id: 7, text: 'New', category: { id: 5, name: 'Personality' } },
          { id: 8, text: 'Other', category: null },
        ],
        categories: [{ id: 5, name: 'Personality' }],
      };
      nexusaiAPI.agent_builder.instructions.update.mockResolvedValue(updated);

      store.startEditingInstruction({ id: 7 });
      store.newInstruction.text = 'New';
      store.newInstruction.category = { id: 5, name: 'Personality' };

      await store.updateEditingInstruction();

      expect(nexusaiAPI.agent_builder.instructions.update).toHaveBeenCalledWith(
        expect.objectContaining({ projectUuid: 'test-project-uuid' }),
      );
      expect(store.instructions.data).toEqual(updated.instructions);
      expect(store.categories).toEqual(updated.categories);
      expect(store.newInstruction.status).toBeNull();
    });
  });

  describe('groupedInstructions getter', () => {
    const viewT = (key) => i18n.global.t(`agents.instructions.view.${key}`);

    const keysOf = () => store.groupedInstructions.map((group) => group.key);
    const groupByKey = (key) =>
      store.groupedInstructions.find((group) => group.key === key);

    it('groups custom categories ordered by the last added instruction', () => {
      store.categories = [
        { id: 10, name: 'Sales' },
        { id: 20, name: 'Support' },
      ];
      store.instructions.data = [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
        { id: 5, text: 'Support A', category: { id: 20, name: 'Support' } },
        { id: 3, text: 'Sales B', category: { id: 10, name: 'Sales' } },
      ];

      expect(keysOf()).toEqual(['category-20', 'category-10', 'default']);
    });

    it('orders instructions within a group by the last inserted first', () => {
      store.categories = [{ id: 10, name: 'Sales' }];
      store.instructions.data = [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
        { id: 3, text: 'Sales B', category: { id: 10, name: 'Sales' } },
      ];

      expect(groupByKey('category-10').instructions.map((i) => i.text)).toEqual(
        ['Sales B', 'Sales A'],
      );
    });

    it('keeps custom categories without instructions for the empty state', () => {
      store.categories = [{ id: 10, name: 'Empty' }];
      store.instructions.data = [];

      const group = groupByKey('category-10');
      expect(group).toBeDefined();
      expect(group.locked).toBe(false);
      expect(group.instructions).toEqual([]);
    });

    it('shows the Uncategorized locked group only when it has instructions', () => {
      store.categories = [];
      store.instructions.data = [
        { id: 1, text: 'Loose instruction', category: null },
      ];

      const group = groupByKey('uncategorized');
      expect(group.label).toBe(viewT('uncategorized'));
      expect(group.locked).toBe(true);
      expect(group.instructions).toHaveLength(1);
    });

    it('hides the Uncategorized group when there are no uncategorized instructions', () => {
      store.categories = [{ id: 10, name: 'Sales' }];
      store.instructions.data = [
        { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
      ];

      expect(groupByKey('uncategorized')).toBeUndefined();
    });

    it('always exposes the mocked Default instructions locked group', () => {
      store.categories = [];
      store.instructions.data = [];
      const legacyDefaultInstructions = i18n.global.tm(
        'agent_builder.instructions.instructions_list.default_instructions',
      );

      const group = groupByKey('default');
      expect(group.label).toBe(viewT('default_instructions'));
      expect(group.locked).toBe(true);
      expect(group.instructions).toHaveLength(legacyDefaultInstructions.length);
      expect(group.instructions.map((i) => i.text)).toEqual(
        legacyDefaultInstructions,
      );
      expect(
        group.instructions.some((i) => i.text.includes('specialized team')),
      ).toBe(true);
      expect(group.instructions.every((i) => i.locked)).toBe(true);
    });

    it('filters instructions by the search term and hides groups without matches', () => {
      store.categories = [{ id: 10, name: 'Sales' }];
      store.instructions.data = [
        { id: 1, text: 'tracking number', category: { id: 10, name: 'Sales' } },
        { id: 2, text: 'refund policy', category: { id: 10, name: 'Sales' } },
      ];
      store.searchTerm = 'tracking';

      expect(keysOf()).toEqual(['category-10']);
      expect(groupByKey('category-10').instructions.map((i) => i.text)).toEqual(
        ['tracking number'],
      );
    });
  });
});
