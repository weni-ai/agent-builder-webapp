import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import Particles from '../Particles.vue';

describe('Particles.vue', () => {
  let wrapper;

  const particlesContainer = () => wrapper.find('#particles-container');
  const vueParticles = () => wrapper.findComponent({ name: 'vue-particles' });

  beforeEach(() => {
    wrapper = shallowMount(Particles, {
      global: {
        stubs: {
          'vue-particles': {
            name: 'vue-particles',
            template: '<div class="vue-particles-stub"></div>',
            props: ['id', 'options'],
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders correctly with default props', () => {
      expect(particlesContainer().exists()).toBe(true);
      expect(vueParticles().exists()).toBe(true);
    });

    it('renders particles container with correct id', () => {
      expect(particlesContainer().attributes('id')).toBe('particles-container');
    });

    it('renders vue-particles component with particles class', () => {
      expect(vueParticles().classes()).toContain('particles');
    });
  });

  describe('Default props', () => {
    it('uses default color value', () => {
      expect(wrapper.vm.color).toBe('#00DED2');
    });

    it('uses default direction value', () => {
      expect(wrapper.vm.direction).toBe('none');
    });

    it('uses default id value', () => {
      expect(wrapper.vm.id).toBe('particles');
    });

    it('passes default id to vue-particles component', () => {
      expect(vueParticles().props('id')).toBe('particles');
    });
  });

  describe('id prop', () => {
    it('passes custom id to vue-particles component', async () => {
      await wrapper.setProps({ id: 'custom-particles' });
      expect(vueParticles().props('id')).toBe('custom-particles');
    });
  });

  describe('Vue-particles configuration', () => {
    it('passes correct options with default props', () => {
      const options = vueParticles().props('options');

      expect(options.fullScreen.enable).toBe(false);
      expect(options.background.color.value).toBe('transparent');
      expect(options.fpsLimit).toBe(60);
      expect(options.particles.color.value).toEqual(['#00DED2']);
      expect(options.particles.move.direction).toBe('none');
      expect(options.particles.move.speed).toBe(2);
      expect(options.particles.number.value).toBe(10);
      expect(options.detectRetina).toBe(true);
    });

    it('updates particle color when color prop changes', async () => {
      await wrapper.setProps({ color: '#F6AD55' });
      const options = vueParticles().props('options');
      expect(options.particles.color.value).toEqual(['#F6AD55']);
    });

    it('updates particle direction when direction prop changes', async () => {
      await wrapper.setProps({ direction: 'left' });
      const options = vueParticles().props('options');
      expect(options.particles.move.direction).toBe('left');
    });

    it('has correct particle configuration', () => {
      const options = vueParticles().props('options');

      expect(options.particles.links.enable).toBe(false);
      expect(options.particles.move.enable).toBe(true);
      expect(options.particles.move.outModes).toBe('out');
      expect(options.particles.move.random).toBe(false);
      expect(options.particles.move.straight).toBe(false);
      expect(options.particles.collisions.enable).toBe(true);
      expect(options.particles.collisions.mode).toBe('bounce');
      expect(options.particles.opacity.value).toBe(0.5);
      expect(options.particles.opacity.random).toBe(false);
      expect(options.particles.shape.type).toBe('circle');
      expect(options.particles.size.value).toEqual({ min: 2, max: 8 });
      expect(options.particles.size.random).toBe(true);
    });
  });

  describe('Component structure', () => {
    it('has correct CSS class on particles element', () => {
      expect(vueParticles().classes()).toContain('particles');
    });
  });

  describe('Reactivity', () => {
    it('updates vue-particles options when props change', async () => {
      const initialOptions = vueParticles().props('options');
      expect(initialOptions.particles.color.value).toEqual(['#00DED2']);
      expect(initialOptions.particles.move.direction).toBe('none');

      await wrapper.setProps({
        color: '#F6AD55',
        direction: 'left',
      });

      const updatedOptions = vueParticles().props('options');
      expect(updatedOptions.particles.color.value).toEqual(['#F6AD55']);
      expect(updatedOptions.particles.move.direction).toBe('left');
    });

    it('maintains other options when props change', async () => {
      await wrapper.setProps({ color: '#F6AD55' });

      const options = vueParticles().props('options');
      expect(options.fpsLimit).toBe(60);
      expect(options.particles.number.value).toBe(10);
      expect(options.particles.move.speed).toBe(2);
      expect(options.detectRetina).toBe(true);
    });
  });
});
