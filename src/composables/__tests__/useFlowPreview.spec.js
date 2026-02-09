import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useFlowPreview from '../useFlowPreview';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
  })),
}));

describe('useFlowPreview', () => {
  let flowPreview;
  let mathRandomSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123);

    flowPreview = useFlowPreview();
  });

  afterEach(() => {
    mathRandomSpy?.mockRestore();
  });

  describe('previewInit', () => {
    it('should initialize preview contact correctly', () => {
      flowPreview.previewInit();

      expect(flowPreview.preview.value.contact.uuid).toBe('mock-uuid');
      expect(flowPreview.preview.value.contact.urn).toMatch(/^tel:/);
    });
  });
});
