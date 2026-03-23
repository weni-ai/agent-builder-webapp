import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/utils/plugins/i18n';

import ToneOfVoiceRadios from '../ToneOfVoiceRadios.vue';

const TONE_IDS = ['friendly', 'systematic', 'analytical', 'creative', 'casual'];

describe('ToneOfVoiceRadios.vue', () => {
  let wrapper;

  const findForm = () => wrapper.find('[data-testid="tone-of-voice-radios"]');
  const findRadio = (toneId) =>
    wrapper.find(`[data-testid="tone-of-voice-radio-${toneId}"]`);

  const createWrapper = (props = {}) => {
    wrapper = mount(ToneOfVoiceRadios, {
      props: {
        selectedTone: 'friendly',
        ...props,
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component structure', () => {
    it('renders the form with stable test id', () => {
      createWrapper();
      expect(findForm().exists()).toBe(true);
      expect(findForm().element.tagName).toBe('FORM');
    });

    it('renders one radio option per tone from i18n', () => {
      createWrapper();
      TONE_IDS.forEach((id) => {
        expect(findRadio(id).exists()).toBe(true);
      });
    });

    it('renders each tone with translated name', () => {
      createWrapper({ selectedTone: 'friendly' });
      const friendlyName = i18n.global.t(
        'agents.profile.tone_of_voice.tones.friendly.name',
      );
      expect(findRadio('friendly').text()).toContain(friendlyName);
    });
  });

  describe('Selected state', () => {
    it('applies selected class only to the option matching selectedTone', () => {
      createWrapper({ selectedTone: 'systematic' });
      const systematicButton = findRadio('systematic').element;
      const friendlyButton = findRadio('friendly').element;

      expect(systematicButton.className).toContain(
        'tone-of-voice-radios__radio-inner--selected',
      );
      expect(friendlyButton.className).not.toContain(
        'tone-of-voice-radios__radio-inner--selected',
      );
    });

    it('applies selected class to friendly when selectedTone is friendly', () => {
      createWrapper({ selectedTone: 'friendly' });
      expect(findRadio('friendly').element.className).toContain(
        'tone-of-voice-radios__radio-inner--selected',
      );
    });
  });

  describe('Event handling', () => {
    it('emits update:selected-tone with tone id when a radio option is selected', async () => {
      createWrapper({ selectedTone: 'friendly' });
      await findRadio('creative').find('input').trigger('change');

      expect(wrapper.emitted('update:selected-tone')).toEqual([['creative']]);
    });

    it('emits update:selected-tone when another option is selected', async () => {
      createWrapper({ selectedTone: 'analytical' });
      await findRadio('casual').find('input').trigger('change');

      expect(wrapper.emitted('update:selected-tone')).toEqual([['casual']]);
    });

    it('emits update:selected-tone when Enter is pressed on a radio button', async () => {
      createWrapper({ selectedTone: 'friendly' });
      await findRadio('systematic').trigger('keydown.enter');

      expect(wrapper.emitted('update:selected-tone')).toEqual([['systematic']]);
    });
  });

  describe('Form behavior', () => {
    it('prevents form submit default behavior', async () => {
      createWrapper();
      const form = findForm();
      const event = new Event('submit', { bubbles: true, cancelable: true });
      event.preventDefault = vi.fn();
      form.element.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });
});
