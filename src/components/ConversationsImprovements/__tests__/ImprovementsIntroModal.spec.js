import { shallowMount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '@/utils/plugins/i18n';

import ImprovementsIntroModal from '../ImprovementsIntroModal/index.vue';
import { getHelpGuideUrl } from '../ImprovementsIntroModal/steps';

describe('ImprovementsIntroModal.vue', () => {
  let wrapper;

  const findHelpGuideButton = () =>
    wrapper.find('[data-testid="improvements-intro-modal-help-guide"]');

  const createWrapper = () => {
    wrapper = shallowMount(ImprovementsIntroModal, {
      props: { open: true },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    i18n.global.locale.value = 'en';
    vi.restoreAllMocks();
  });

  it('opens the locale-specific help guide in a new tab', async () => {
    i18n.global.locale.value = 'es';
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    createWrapper();

    await findHelpGuideButton().trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      getHelpGuideUrl('es'),
      '_blank',
      'noopener,noreferrer',
    );
  });
});
