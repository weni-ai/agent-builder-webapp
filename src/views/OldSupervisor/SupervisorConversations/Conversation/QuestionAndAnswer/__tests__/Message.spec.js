import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import Message from '../Message.vue';

describe('Message.vue', () => {
  let wrapper;

  const defaultProps = {
    content: {
      text: 'Hello world',
      images: [],
      audio: null,
    },
    scheme: 'neutral',
  };

  const createWrapper = (props = {}) => {
    wrapper = mount(Message, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        stubs: {
          UnnnicAudioRecorder: true,
        },
      },
    });
  };

  const messageDisplay = () =>
    wrapper.findComponent('[data-testid="message-display"]');
  const messageComponent = () =>
    wrapper.findComponent('[data-testid="message-component"]');
  const audioRecorder = () =>
    wrapper.findComponent('[data-testid="audio-recorder"]');
  const images = () => wrapper.findAll('[data-testid="image"]');

  beforeEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders with success scheme', () => {
      createWrapper({ scheme: 'success' });

      expect(
        wrapper.find('.question-and-answer__message--success').exists(),
      ).toBe(true);
      expect(
        wrapper.find('.question-and-answer__message--neutral').exists(),
      ).toBe(false);
    });

    it('renders MessageDisplay when there is text content', () => {
      createWrapper({
        content: { text: 'Test message' },
      });

      expect(messageDisplay().exists()).toBe(true);
    });

    it('does not render MessageDisplay when there is no text content', () => {
      createWrapper({
        content: { text: '' },
      });

      expect(messageDisplay().exists()).toBe(false);
    });
  });

  describe('Image extraction and rendering', () => {
    it('extracts and renders images from text content', () => {
      const content = {
        text: "Here is an image: ['image/png:https://example.com/image.png'] and some text",
      };

      createWrapper({ content });

      expect(images()).toHaveLength(1);
      expect(images()[0].attributes('src')).toBe(
        'https://example.com/image.png',
      );
      expect(images()[0].attributes('alt')).toBe('Image (image/png)');
    });

    it('extracts multiple images from text content', () => {
      const content = {
        text: "Images: ['image/png:https://example.com/1.png'] and ['image/jpeg:https://example.com/2.jpg']",
      };

      createWrapper({ content });

      expect(images()).toHaveLength(2);
      expect(images()[0].attributes('src')).toBe('https://example.com/1.png');
      expect(images()[1].attributes('src')).toBe('https://example.com/2.jpg');
    });

    it('does not render images when no image patterns are found', () => {
      const content = {
        text: 'Just plain text without images',
      };

      createWrapper({ content });

      expect(images()).toHaveLength(0);
    });

    it('removes image patterns from text content', () => {
      const content = {
        text: "Before ['image/png:https://example.com/image.png'] after",
      };

      createWrapper({ content });

      expect(messageDisplay().props('message').text).toBe('Before  after');
    });
  });

  describe('Audio extraction and rendering', () => {
    it('extracts and renders audio from text content', () => {
      const content = {
        text: "Audio message: ['audio/mp3:https://example.com/audio.mp3']",
      };

      createWrapper({ content });

      expect(audioRecorder().exists()).toBe(true);
      expect(audioRecorder().props('src')).toBe(
        'https://example.com/audio.mp3',
      );
      expect(audioRecorder().props('canDiscard')).toBe(false);
    });

    it('only renders first audio when multiple audio patterns exist', () => {
      const content = {
        text: "Audios: ['audio/mp3:https://example.com/1.mp3'] and ['audio/wav:https://example.com/2.wav']",
      };

      createWrapper({ content });

      expect(audioRecorder().props('src')).toBe('https://example.com/1.mp3');
    });

    it('does not render audio when no audio patterns are found', () => {
      const content = {
        text: 'Just plain text without audio',
      };

      createWrapper({ content });

      expect(audioRecorder().exists()).toBe(false);
    });

    it('removes audio patterns from text content', () => {
      const content = {
        text: "Before ['audio/mp3:https://example.com/audio.mp3'] after",
      };

      createWrapper({ content });

      expect(messageDisplay().props('message').text).toBe('Before  after');
    });
  });

  describe('JSON message parsing', () => {
    it('parses valid JSON content', () => {
      const jsonMessage = {
        msg: {
          text: 'JSON text content',
          images: [
            {
              url: 'https://example.com/json-image.png',
              type: 'image/png',
              alt: 'JSON Image',
            },
          ],
          audio: {
            url: 'https://example.com/json-audio.mp3',
            type: 'audio/mp3',
          },
        },
      };

      const content = {
        text: JSON.stringify(jsonMessage),
      };

      createWrapper({ content });

      expect(messageDisplay().props('message').text).toBe('JSON text content');

      expect(images()).toHaveLength(1);
      expect(images()[0].attributes('src')).toBe(
        'https://example.com/json-image.png',
      );

      expect(audioRecorder().exists()).toBe(true);
      expect(audioRecorder().props('src')).toBe(
        'https://example.com/json-audio.mp3',
      );
    });

    it('falls back to plain text when JSON parsing fails', () => {
      const content = {
        text: 'Invalid JSON: {broken json}',
      };

      createWrapper({ content });

      expect(messageDisplay().props('message').text).toBe(
        'Invalid JSON: {broken json}',
      );
    });
  });

  describe('Mixed media content', () => {
    it('handles content with both images and audio', () => {
      const content = {
        text: "Mixed: ['image/png:https://example.com/image.png'] and ['audio/mp3:https://example.com/audio.mp3'] content",
      };

      createWrapper({ content });

      expect(images()).toHaveLength(1);
      expect(images()[0].attributes('src')).toBe(
        'https://example.com/image.png',
      );

      expect(audioRecorder().exists()).toBe(true);
      expect(audioRecorder().props('src')).toBe(
        'https://example.com/audio.mp3',
      );

      expect(messageDisplay().props('message').text).toBe(
        'Mixed:  and  content',
      );
    });

    it('prioritizes JSON content over pattern extraction', () => {
      const jsonMessage = {
        msg: {
          text: 'JSON text',
          images: [
            {
              url: 'https://json.com/image.png',
              type: 'image/png',
              alt: 'JSON Image',
            },
          ],
        },
      };

      const content = {
        text:
          JSON.stringify(jsonMessage) +
          " ['image/png:https://pattern.com/image.png']",
      };

      createWrapper({ content });

      expect(images()).toHaveLength(1);
      expect(images()[0].attributes('src')).toBe('https://json.com/image.png');

      expect(messageDisplay().props('message').text).toBe('JSON text');
    });
  });

  describe('MessageComponentResolver integration', () => {
    it('passes the correct message to MessageComponentResolver', () => {
      const jsonMessage = {
        msg: {
          text: 'Component message',
          quick_replies: ['Yes', 'No'],
        },
      };

      const content = {
        text: JSON.stringify(jsonMessage),
      };

      createWrapper({ content });

      expect(messageComponent().exists()).toBe(true);
      expect(messageComponent().props('message')).toEqual(jsonMessage.msg);
    });

    it('passes original content when no JSON parsing is successful', () => {
      const content = {
        text: 'Plain text message',
        quick_replies: ['Option 1'],
      };

      createWrapper({ content });

      expect(messageComponent().exists()).toBe(true);
      expect(messageComponent().props('message')).toEqual(content);
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles null content gracefully', () => {
      createWrapper({ content: null });

      expect(messageDisplay().exists()).toBe(false);
      expect(images()).toHaveLength(0);
      expect(audioRecorder().exists()).toBe(false);
    });

    it('handles undefined content gracefully', () => {
      createWrapper({ content: undefined });

      expect(messageDisplay().exists()).toBe(false);
    });

    it('handles empty text content', () => {
      createWrapper({ content: { text: '' } });

      expect(messageDisplay().exists()).toBe(false);
      expect(images()).toHaveLength(0);
      expect(audioRecorder().exists()).toBe(false);
    });

    it('handles whitespace-only text content', () => {
      createWrapper({ content: { text: '   \n\t   ' } });

      expect(messageDisplay().exists()).toBe(false);
    });

    it('validates scheme prop correctly', () => {
      // Test valid schemes
      createWrapper({ scheme: 'neutral' });
      expect(
        wrapper.find('.question-and-answer__message--neutral').exists(),
      ).toBe(true);

      createWrapper({ scheme: 'success' });
      expect(
        wrapper.find('.question-and-answer__message--success').exists(),
      ).toBe(true);
    });
  });
});
