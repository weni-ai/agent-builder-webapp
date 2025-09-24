<template>
  <svg
    :width="width"
    :height="height"
    class="branch-lines"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid="branch-lines-svg"
  >
    <defs>
      <linearGradient
        id="branchGradient"
        x1="0"
        x2="25"
        :y1="0"
        :y2="
          (props.positions[treatedColoredLineIndex]?.endY || 0) -
          coloredLineOffset
        "
        gradientUnits="userSpaceOnUse"
        data-testid="branch-gradient"
      >
        <stop
          offset="0"
          stop-color="#086766"
          data-testid="gradient-start"
        />
        <stop
          offset="1"
          stop-color="#4DFBEA"
          data-testid="gradient-end"
        />
      </linearGradient>
    </defs>

    <!-- Regular lines -->
    <path
      v-for="(path, index) in regularPaths"
      :key="`regular-${index}`"
      :d="path.d"
      stroke="#E2E6ED"
      stroke-width="1"
      stroke-linejoin="round"
      :data-testid="`regular-path-${index}`"
    />

    <!-- Colored line -->
    <path
      v-if="coloredPath"
      :d="coloredPath.d"
      :style="{
        strokeDasharray:
          props.positions[treatedColoredLineIndex].endY + 25 + 'px',
        strokeDashoffset: coloredLineOffset + 'px',
      }"
      class="branch-lines__colored"
      stroke="url(#branchGradient)"
      stroke-width="3"
      stroke-linejoin="round"
      data-testid="colored-path"
    />
  </svg>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  positions: {
    type: Array,
    required: true,
    default: () => [],
  },
  width: {
    type: [Number, String],
    default: '100%',
  },
  height: {
    type: [Number, String],
    default: '100%',
  },
  startY: {
    type: [Number, String],
    default: 0,
  },
  coloredLineIndex: {
    type: Number,
    default: -1,
  },
});

function generatePath(position) {
  const centerX = 13;
  const startY = position.startY || 0;
  const endY = position.endY || 142;
  const isLeft = position.isLeft || false;
  const radius = position.radius || 8;
  const targetX = isLeft ? 0 : 25;
  const controlX = isLeft ? centerX - radius : centerX + radius;

  return {
    d: `M${centerX} ${startY}V${endY}C${centerX} ${endY + radius}, ${controlX} ${endY + radius}, ${targetX} ${endY + radius}H${targetX}`,
  };
}

const regularPaths = computed(() =>
  props.positions.map((position) => generatePath(position)).filter(Boolean),
);

const coloredPath = computed(() => {
  if (
    treatedColoredLineIndex.value < 0 ||
    treatedColoredLineIndex.value >= props.positions.length
  ) {
    return null;
  }

  return generatePath(props.positions[treatedColoredLineIndex.value]);
});

const treatedColoredLineIndex = ref(-1);
const interval = ref(null);
const offsetMax = computed(() => {
  return props.positions[props.coloredLineIndex]?.endY + 25 || 0;
});
const coloredLineOffset = ref(0);
const isAnimating = ref(false);
const animationTime = ref(0.5);

function enterColoredLineAnimation() {
  return new Promise((resolve) => {
    isAnimating.value = true;
    if (interval.value) clearInterval(interval.value);

    if (coloredLineOffset.value <= 0) {
      isAnimating.value = false;
      resolve();
      return;
    }

    interval.value = setInterval(() => {
      if (coloredLineOffset.value <= 0) {
        clearInterval(interval.value);
        isAnimating.value = false;
        resolve();
      } else {
        coloredLineOffset.value -= 1;
      }
    }, animationTime.value);
  });
}

function leaveColoredLineAnimation(oldVal) {
  return new Promise((resolve) => {
    isAnimating.value = true;

    if (interval.value) clearInterval(interval.value);

    const targetOffset = props.positions[oldVal]?.endY + 25;

    if (coloredLineOffset.value >= targetOffset) {
      isAnimating.value = false;
      resolve();
      return;
    }

    interval.value = setInterval(() => {
      if (coloredLineOffset.value < targetOffset) {
        coloredLineOffset.value += 1;
      } else {
        clearInterval(interval.value);
        isAnimating.value = false;
        resolve();
      }
    }, animationTime.value);
  });
}

function changeColoredLineAnimation(newColoredLineIndex, oldColoredLineIndex) {
  isAnimating.value = true;
  if (interval.value) clearInterval(interval.value);

  const initialOffset = coloredLineOffset.value;
  const newEndY = props.positions[newColoredLineIndex]?.endY;
  const oldEndY = props.positions[oldColoredLineIndex]?.endY;

  const targetOffset = (() => {
    if (newColoredLineIndex > oldColoredLineIndex || newEndY === oldEndY) {
      return Math.round(initialOffset + 25);
    }

    return Math.round(initialOffset + (oldEndY - newEndY) + 25);
  })();

  function upAnimation() {
    return new Promise((resolve) => {
      const upInterval = setInterval(() => {
        if (coloredLineOffset.value < targetOffset) {
          coloredLineOffset.value += 1;
        } else {
          clearInterval(upInterval);
          treatedColoredLineIndex.value = newColoredLineIndex;

          resolve();
        }
      }, animationTime.value);
    });
  }

  function downAnimation() {
    return new Promise((resolve) => {
      const downInterval = setInterval(() => {
        if (
          coloredLineOffset.value !== offsetMax.value &&
          coloredLineOffset.value > 0
        ) {
          coloredLineOffset.value -= 1;
        } else {
          clearInterval(downInterval);
          resolve();
        }
      }, animationTime.value);
    });
  }

  return new Promise((resolve) => {
    upAnimation().then(() => {
      if (oldEndY < newEndY) {
        coloredLineOffset.value = 25 + newEndY - oldEndY;
      }

      if (newEndY < oldEndY) {
        coloredLineOffset.value = 25;
      }

      downAnimation().then(() => {
        isAnimating.value = false;
        resolve();
      });
    });
  });
}

async function animateColoredLine(newVal, oldVal) {
  if (oldVal > -1 && newVal > -1) {
    await changeColoredLineAnimation(newVal, oldVal);
  } else if (newVal === -1) {
    await leaveColoredLineAnimation(oldVal);
    treatedColoredLineIndex.value = -1;
  } else {
    treatedColoredLineIndex.value = props.coloredLineIndex;
    await enterColoredLineAnimation();
  }
}

watch(
  () => props.coloredLineIndex,
  (newVal, oldVal) => {
    if (oldVal === -1) {
      coloredLineOffset.value = offsetMax.value;
    }

    if (!isAnimating.value) {
      animateColoredLine(newVal, oldVal);
    }
  },
);

onMounted(() => {
  treatedColoredLineIndex.value = props.coloredLineIndex;
});

onUnmounted(() => {
  clearInterval(interval.value);
});
</script>

<style scoped>
.branch-lines {
  position: absolute;
  left: 50%;
  top: v-bind('startY - 8 + "px"');
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 0;

  &__colored {
    stroke-dasharray: 102px;
    stroke-dashoffset: v-bind('coloredLineOffset + "px"');
  }
}
</style>
