import nexusaiAPI from '@/api/nexusaiAPI';
import { useProfileStore } from '@/store/Profile';
import { createPinia, setActivePinia } from 'pinia';
import { beforeAll, beforeEach, vi } from 'vitest';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: '1234' }),
}));

const profileRead = vi
  .spyOn(nexusaiAPI.router.profile, 'read')
  .mockResolvedValue({
    data: {
      agent: {
        name: 'Initial Name',
        role: 'Initial Role',
        personality: 'Initial Personality',
        goal: 'Initial Goal',
      },

      instructions: [{ id: '1', instruction: 'First Instruction' }],
    },
  });

const profileInstructionDelete = vi
  .spyOn(nexusaiAPI.router.profile, 'delete')
  .mockResolvedValue();

describe('Profile', () => {
  let profileStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    profileStore = useProfileStore();
  });

  it('status should be null initially', () => {
    expect(profileStore.status).toBe(null);
  });

  describe('when load is called', () => {
    it('status should be loading', () => {
      profileStore.load();
      profileStore.load();

      expect(profileStore.status).toBe('loading');
      expect(profileRead).toHaveBeenCalledTimes(1);
    });

    describe('when load is complete', () => {
      beforeEach(() => {
        profileStore.load();
      });

      it('status should be complete', () => {
        expect(profileStore.status).toBe('complete');
      });

      it('should call the API with the correct params', () => {
        expect(profileRead).toHaveBeenCalledWith({
          projectUuid: '1234',
        });
      });

      it('should fill the store with the API data', () => {
        expect(profileStore).toEqual(
          expect.objectContaining({
            name: { current: 'Initial Name', old: 'Initial Name' },
            role: { current: 'Initial Role', old: 'Initial Role' },
            personality: {
              current: 'Initial Personality',
              old: 'Initial Personality',
            },
            goal: { current: 'Initial Goal', old: 'Initial Goal' },
          }),
        );

        expect(profileStore.instructions).toEqual({
          current: [{ id: '1', instruction: 'First Instruction' }],
          old: [{ id: '1', instruction: 'First Instruction' }],
        });
      });

      describe('when the user wants to add a new empty instruction', () => {
        beforeAll(() => {
          profileStore.addEmptyInstruction();
        });

        beforeEach(() => {
          vi.clearAllMocks();
        });

        it('should add a new empty instruction', () => {
          expect(profileStore.instructions).toEqual({
            current: [
              { id: '1', instruction: 'First Instruction' },
              { instruction: '' },
            ],
            old: [
              { id: '1', instruction: 'First Instruction' },
              { instruction: '' },
            ],
          });
        });

        describe('when the user wants to remove the previously already saved instruction', () => {
          it('should call the API with the correct params', async () => {
            const instructionIndex = 0;

            await profileStore.removeInstruction(instructionIndex);

            expect(profileInstructionDelete).toHaveBeenCalledWith({
              id: '1',
              projectUuid: '1234',
            });
          });

          it('should remove the instruction', () => {
            expect(profileStore.instructions).toEqual({
              current: [{ instruction: '' }],
              old: [{ instruction: '' }],
            });
          });
        });

        describe('when the user wants to remove the locally only instruction', () => {
          beforeEach(() => {
            const instructionIndex = 0;

            profileStore.removeInstruction(instructionIndex);
          });

          it('should not call the API', () => {
            expect(profileInstructionDelete).not.toHaveBeenCalled();
          });

          it('should remove the instruction', () => {
            expect(profileStore.instructions).toEqual({
              current: [],
              old: [],
            });
          });
        });
      });

      it('has changed should be false', () => {
        expect(profileStore.hasChanged).toBe(false);
      });

      describe.each(['name', 'role', 'personality', 'goal'])(
        'when the user changes the %s attribute',
        (attribute) => {
          it('hasChanged should be true', () => {
            profileStore[attribute].current = 'Changed';

            expect(profileStore.hasChanged).toBe(true);
          });
        },
      );

      it('has changed should be false whe the instruction text changes', () => {
        profileStore.instructions.current[0].instruction = 'Changed';

        expect(profileStore.hasChanged).toBe(true);
      });
    });
  });

  describe('when the API return error', () => {
    it('status should be error', async () => {
      profileRead.mockRejectedValueOnce();

      await profileStore.load();

      expect(profileStore.status).toBe('error');
    });
  });

  describe('isSaveButtonDisabled', () => {
    it('should be true when hasChanged is false', () => {
      expect(profileStore.isSaveButtonDisabled).toBe(true);
    });

    it('should be false when hasChanged is true', () => {
      profileStore.name.current = 'Changed';
      expect(profileStore.isSaveButtonDisabled).toBe(false);
    });

    it('should be true when errorRequiredFields is not empty', () => {
      profileStore.errorRequiredFields = { name: true };
      expect(profileStore.isSaveButtonDisabled).toBe(true);
    });

    it('should be false when errorRequiredFields is empty', () => {
      profileStore.errorRequiredFields = {};
      profileStore.name.current = 'Changed';
      expect(profileStore.isSaveButtonDisabled).toBe(false);
    });
  });

  describe('validate', () => {
    it('should throw an error when name is empty', () => {
      profileStore.name.current = '';
      expect(() => profileStore.validate()).toThrowError();
    });

    it('should throw an error when role is empty', () => {
      profileStore.role.current = '';
      expect(() => profileStore.validate()).toThrowError();
    });

    it('should throw an error when goal is empty', () => {
      profileStore.goal.current = '';
      expect(() => profileStore.validate()).toThrowError();
    });

    it('should not throw an error when all fields are filled', () => {
      profileStore.name.current = 'Test Name';
      profileStore.role.current = 'Test Role';
      profileStore.goal.current = 'Test Goal';
      expect(() => profileStore.validate()).not.toThrowError();
    });

    it('should set errorRequiredFields correctly', () => {
      profileStore.name.current = '';
      profileStore.role.current = 'Test Role';
      profileStore.goal.current = 'Test Goal';

      try {
        profileStore.validate();
      } catch (e) {
        // this catch is only here to make the test pass without throwing
      }

      expect(profileStore.errorRequiredFields).toMatchObject({
        name: true,
      });
    });

    it('should watch for changes in required fields', () => {
      profileStore.name.current = '';
      try {
        profileStore.validate();
      } catch (e) {
        // this catch is only here to make the test pass without throwing
      }
      profileStore.name.current = 'Test Name';
      expect(profileStore.errorRequiredFields).toMatchObject({
        name: true,
      });
    });
  });

  describe('save', () => {
    it('should call nexusaiAPI with correct data', async () => {
      const editSpy = vi.spyOn(nexusaiAPI.router.profile, 'edit');
      profileStore.name.current = 'Test Name';
      profileStore.role.current = 'Test Role';
      profileStore.personality.current = 'Test Personality';
      profileStore.instructions.current = ['Test Instruction'];
      profileStore.goal.current = 'Test Goal';
      await profileStore.save();
      expect(editSpy).toHaveBeenCalledTimes(1);
      expect(editSpy).toHaveBeenCalledWith({
        data: {
          agent: {
            goal: 'Test Goal',
            name: 'Test Name',
            personality: 'Test Personality',
            role: 'Test Role',
          },
          instructions: [],
        },
        projectUuid: '1234',
      });
    });
  });
});
