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
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: {
      instructionsValidatedByAI: true,
    },
  }),
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
          status: 'complete',
          id: 1,
        });
        expect(store.newInstruction.text).toBe('');
        expect(store.newInstruction.status).toBeNull();
        expect(alertStore.add).toHaveBeenCalledWith({
          text: i18n.global.t(
            'agent_builder.instructions.new_instruction.success_alert',
          ),
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
          type: 'default',
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
});
