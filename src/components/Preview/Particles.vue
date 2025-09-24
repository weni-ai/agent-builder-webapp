<template>
  <section id="particles-container">
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <vue-particles
      :id="id"
      class="particles"
      :options="{
        fullScreen: {
          enable: false,
        },
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: [color],
          },
          links: {
            enable: false,
          },
          move: {
            direction,
            enable: true,
            outModes: 'out',
            random: false,
            speed: 2,
            straight: false,
          },
          collisions: {
            enable: true,
            mode: 'bounce',
          },
          number: {
            value: 10,
          },
          opacity: {
            value: 0.5,
            random: false,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 2, max: 8 },
            random: true,
          },
        },
        detectRetina: true,
      }"
    />
  </section>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: '#00DED2',
    validator: (value) => {
      return ['#00DED2', '#F6AD55'].includes(value);
    },
  },
  direction: {
    type: String,
    default: 'none',
    validator: (value) => {
      return ['left', 'right', 'bounce', 'none'].includes(value);
    },
  },
  id: {
    type: String,
    default: 'particles',
  },
});
</script>

<style lang="scss" scoped>
.particles {
  height: 100%;
}
</style>
