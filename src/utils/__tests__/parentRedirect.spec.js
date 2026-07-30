import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirectInParent } from '@/utils/parentRedirect';

describe('parentRedirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('posts a redirect event with the given path', () => {
    redirectInParent({ path: 'aiBuild:knowledge' });

    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        event: 'redirect',
        path: 'aiBuild:knowledge',
        openInNew: false,
      },
      '*',
    );
  });

  it('includes query and openInNew when provided', () => {
    redirectInParent({
      path: 'aiConversations:conversations',
      query: { uuid: 'conversation-uuid-1' },
      openInNew: true,
    });

    expect(window.parent.postMessage).toHaveBeenCalledWith(
      {
        event: 'redirect',
        path: 'aiConversations:conversations',
        query: { uuid: 'conversation-uuid-1' },
        openInNew: true,
      },
      '*',
    );
  });
});
