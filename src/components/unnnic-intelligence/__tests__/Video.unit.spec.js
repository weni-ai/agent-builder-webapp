import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Video from '../Video.vue';

const mockPlyr = {
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  restart: vi.fn(),
  muted: false,
  volume: 1,
  speed: 1,
  fullscreen: {
    enter: vi.fn(),
    exit: vi.fn(),
    enabled: true,
  },
};

vi.mock('plyr', () => ({
  default: vi.fn(() => mockPlyr),
}));

vi.mock('plyr/dist/plyr.css', () => ({}));

describe('Video.vue', () => {
  let wrapper;

  const videoContainer = () => wrapper.find('[data-testid="video-container"]');
  const videoPlayer = () => wrapper.find('[data-testid="video-player"]');
  const videoSource = () => wrapper.find('[data-testid="video-source"]');

  const createWrapper = (props = {}) => {
    return shallowMount(Video, {
      props: {
        src: 'https://example.com/video.mp4',
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

  describe('Component Rendering', () => {
    it('renders the component successfully', () => {
      wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    it('renders the video container', () => {
      wrapper = createWrapper();
      expect(videoContainer().exists()).toBe(true);
      expect(videoContainer().classes()).toContain('unnnic-video__container');
    });

    it('renders the video player element', () => {
      wrapper = createWrapper();
      expect(videoPlayer().exists()).toBe(true);
      expect(videoPlayer().classes()).toContain('unnnic-video__video');
    });

    it('renders the video source element', () => {
      wrapper = createWrapper();
      expect(videoSource().exists()).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('accepts src prop with default empty string', () => {
      const wrapperWithDefaults = shallowMount(Video);
      expect(wrapperWithDefaults.props('src')).toBe('');
      wrapperWithDefaults.unmount();
    });

    it('accepts custom src prop', () => {
      const customSrc = 'https://example.com/custom-video.mp4';
      wrapper = createWrapper({ src: customSrc });
      expect(wrapper.props('src')).toBe(customSrc);
    });

    it('sets src attribute on video source', () => {
      const videoSrc = 'https://example.com/test-video.mp4';
      wrapper = createWrapper({ src: videoSrc });
      expect(videoSource().attributes('src')).toBe(videoSrc);
    });
  });

  describe('CSS Classes', () => {
    it('applies base container class', () => {
      wrapper = createWrapper();
      expect(videoContainer().classes()).toContain('unnnic-video__container');
    });

    it('does not apply fullscreen class initially', () => {
      wrapper = createWrapper();
      expect(videoContainer().classes()).not.toContain('is-fullscreen');
    });

    it('applies fullscreen class when isFullcreen is true', async () => {
      wrapper = createWrapper();
      await wrapper.setData({ isFullcreen: true });
      expect(videoContainer().classes()).toContain('is-fullscreen');
    });

    it('removes fullscreen class when isFullcreen is false', async () => {
      wrapper = createWrapper();
      await wrapper.setData({ isFullcreen: true });
      expect(videoContainer().classes()).toContain('is-fullscreen');

      await wrapper.setData({ isFullcreen: false });
      expect(videoContainer().classes()).not.toContain('is-fullscreen');
    });
  });

  describe('Video Element Structure', () => {
    it('creates video element with correct tag', () => {
      wrapper = createWrapper();
      expect(videoPlayer().element.tagName).toBe('VIDEO');
    });

    it('creates source element with correct tag', () => {
      wrapper = createWrapper();
      expect(videoSource().element.tagName).toBe('SOURCE');
    });

    it('sets up template ref for player', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.$refs.player).toBeDefined();
    });
  });

  describe('Prop Reactivity', () => {
    it('updates source src when prop changes', async () => {
      wrapper = createWrapper({ src: 'initial-video.mp4' });
      expect(videoSource().attributes('src')).toBe('initial-video.mp4');

      await wrapper.setProps({ src: 'updated-video.mp4' });
      expect(videoSource().attributes('src')).toBe('updated-video.mp4');
    });

    it('handles empty src prop', () => {
      wrapper = createWrapper({ src: '' });
      expect(videoSource().attributes('src')).toBe('');
    });

    it('handles undefined src prop', () => {
      wrapper = createWrapper({ src: undefined });
      expect(videoSource().attributes('src')).toBe('');
    });
  });

  describe('Template Structure', () => {
    it('has correct nested element structure', () => {
      wrapper = createWrapper();

      const container = videoContainer();
      const player = container.find('[data-testid="video-player"]');
      const source = player.find('[data-testid="video-source"]');

      expect(container.exists()).toBe(true);
      expect(player.exists()).toBe(true);
      expect(source.exists()).toBe(true);
    });

    it('maintains proper element hierarchy', () => {
      wrapper = createWrapper();

      const container = videoContainer();
      const player = videoPlayer();
      const source = videoSource();

      expect(container.element.contains(player.element)).toBe(true);
      expect(player.element.contains(source.element)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long video URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.mp4';
      wrapper = createWrapper({ src: longUrl });
      expect(videoSource().attributes('src')).toBe(longUrl);
    });

    it('handles special characters in video URL', () => {
      const specialUrl =
        'https://example.com/video%20with%20spaces&special=chars.mp4';
      wrapper = createWrapper({ src: specialUrl });
      expect(videoSource().attributes('src')).toBe(specialUrl);
    });

    it('handles relative video URLs', () => {
      const relativeUrl = './videos/local-video.mp4';
      wrapper = createWrapper({ src: relativeUrl });
      expect(videoSource().attributes('src')).toBe(relativeUrl);
    });
  });

  describe('Component State', () => {
    it('maintains isFullcreen state correctly', async () => {
      wrapper = createWrapper();
      expect(wrapper.vm.isFullcreen).toBe(false);

      await wrapper.setData({ isFullcreen: true });
      expect(wrapper.vm.isFullcreen).toBe(true);

      await wrapper.setData({ isFullcreen: false });
      expect(wrapper.vm.isFullcreen).toBe(false);
    });

    it('initializes player as a Plyr instance', () => {
      wrapper = createWrapper();
      const player = wrapper.vm.player;

      expect(player).toBeDefined();
      expect(typeof player.on).toBe('function');
      expect(typeof player.off).toBe('function');
      expect(typeof player.destroy).toBe('function');
      expect(typeof player.play).toBe('function');
      expect(typeof player.pause).toBe('function');
      expect(typeof player.stop).toBe('function');
      expect(typeof player.restart).toBe('function');
      expect(player.muted).toBe(false);
      expect(player.volume).toBe(1);
      expect(player.speed).toBe(1);
      expect(player.fullscreen).toBeDefined();
      expect(typeof player.fullscreen.enter).toBe('function');
      expect(typeof player.fullscreen.exit).toBe('function');
      expect(player.fullscreen.enabled).toBe(true);
    });
  });
});
