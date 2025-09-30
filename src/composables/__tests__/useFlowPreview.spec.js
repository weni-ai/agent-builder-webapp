import { describe, it, expect, vi, beforeEach } from 'vitest';
import useFlowPreview from '../useFlowPreview';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

const mockAuthToken = 'mockAuthToken';
const mockContact = { urns: ['tel:1234567890'], uuid: 'mock-uuid' };

describe('useFlowPreview', () => {
  let flowPreview;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('authToken', mockAuthToken);

    flowPreview = useFlowPreview();
    flowPreview.preview.value.contact = mockContact;
  });

  describe('previewInit', () => {
    it('should initialize preview contact correctly', () => {
      const contentBaseUuid = 'test-content-base-uuid';
      flowPreview.previewInit({ contentBaseUuid });

      expect(flowPreview.preview.value.contact.uuid).toBe('mock-uuid');
      expect(flowPreview.preview.value.contact.urns[0]).toMatch(/^tel:/);
    });
  });
});
