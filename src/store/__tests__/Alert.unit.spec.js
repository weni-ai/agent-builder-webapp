import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAlertStore } from '@/store/Alert';

describe('Alert Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initial state', () => {
    const alertStore = useAlertStore();
    expect(alertStore.id).toBe(0);
    expect(alertStore.data).toEqual({
      text: '',
      type: '',
      description: '',
    });
  });

  it('add alert', () => {
    const alertStore = useAlertStore();
    alertStore.add({ text: 'Test alert', type: 'success' });
    expect(alertStore.id).toBe(1);
    expect(alertStore.data).toEqual({
      text: 'Test alert',
      type: 'success',
      description: '',
    });
  });

  it('add alert with description', () => {
    const alertStore = useAlertStore();
    alertStore.add({
      text: 'Test alert',
      type: 'error',
      description: 'Try again',
    });
    expect(alertStore.data).toEqual({
      text: 'Test alert',
      type: 'error',
      description: 'Try again',
    });
  });

  it('close alert', () => {
    const alertStore = useAlertStore();
    alertStore.add({
      text: 'Test alert',
      type: 'error',
      description: 'Try again',
    });
    alertStore.close();
    expect(alertStore.id).toBe(1);
    expect(alertStore.data).toEqual({
      text: '',
      type: '',
      description: '',
    });
  });
});
