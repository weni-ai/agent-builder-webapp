import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useFlowPreviewStore } from '@/store/FlowPreview';

vi.mock('@/composables/useFlowPreview', () => ({
  default: vi.fn(() => ({
    preview: { value: { contact: { uuid: 'contact-uuid', urn: 'tel:123' } } },
    previewInit: vi.fn(),
  })),
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({ uuid: 'project-uuid' })),
}));

vi.mock('@/store/ManagerSelector', () => ({
  useManagerSelectorStore: vi.fn(() => ({
    selectedPreviewManager: 'manager-uuid',
    options: {
      managers: {
        new: { id: 'manager-uuid', label: 'New Manager' },
        legacy: { id: 'legacy-id', label: 'Legacy Manager' },
      },
    },
  })),
}));

vi.mock('@/utils/medias', () => ({
  getFileType: vi.fn(() => null),
}));

const { uploadFileMock, createMock } = vi.hoisted(() => ({
  uploadFileMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      preview: {
        uploadFile: uploadFileMock,
        create: createMock,
      },
    },
  },
}));

describe('FlowPreview store', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    store = useFlowPreviewStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sendOrder adds an order message', () => {
    store.sendOrder({ id: 1 });

    expect(store.messages).toHaveLength(1);
    expect(store.messages[0]).toMatchObject({
      type: 'order',
      status: 'loaded',
      question_uuid: null,
      text: JSON.stringify({ id: 1 }),
    });
  });

  it('addManagerSelectedMessage adds a manager_selected message with label', () => {
    store.addManagerSelectedMessage('manager-uuid');

    expect(store.messages).toHaveLength(1);
    expect(store.messages[0]).toMatchObject({
      type: 'manager_selected',
      name: 'New Manager',
      question_uuid: null,
    });
  });

  it('sendMessage adds question and schedules answer, treating broadcast response', async () => {
    vi.useFakeTimers();

    createMock.mockResolvedValue({
      data: { type: 'broadcast', message: ['hi', 'there'] },
    });

    store.sendMessage('hello', { delayMs: 10, fallbackMessage: 'fb' });
    expect(store.messages[0]).toMatchObject({
      type: 'question',
      text: 'hello',
    });

    await vi.advanceTimersByTimeAsync(10);
    await vi.runOnlyPendingTimersAsync();

    // one loading answer + one additional message (because message is array with 2 items)
    expect(store.messages.filter((m) => m.type === 'answer')).toHaveLength(2);
    const firstAnswer = store.messages.find((m) => m.type === 'answer');
    expect(firstAnswer.status).toBe('loaded');
    expect(firstAnswer.response).toBe('hi');
  });
});
