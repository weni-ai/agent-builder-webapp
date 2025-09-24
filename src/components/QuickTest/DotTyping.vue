<template>
  <div class="dot-typing" />
</template>

<style lang="scss" scoped>
.dot-typing {
  $dot-size: 0.3125 * $unnnic-font-size;
  $dot-color: $unnnic-color-neutral-clean;
  $dot-min-height: -$dot-size;
  $dot-max-height: (
      -$unnnic-font-size-body-md - $unnnic-line-height-md + $dot-size
    ) *
    0.65;

  width: $dot-size;
  height: $dot-size;
  margin: 0 $dot-size * 1.75;
  margin-top: $unnnic-font-size-body-md + $unnnic-line-height-md - $dot-size;

  border-radius: calc($dot-size / 2);
  background-color: transparent;
  box-shadow:
    -$dot-size * 1.75 ($dot-min-height) $dot-color,
    0 ($dot-min-height) $dot-color,
    $dot-size * 1.75 ($dot-min-height) $dot-color;
  animation: dot-typing 1s infinite ease;

  @keyframes dot-typing {
    0% {
      box-shadow:
        -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    20% {
      box-shadow:
        -$dot-size * 1.75 ($dot-max-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    40% {
      box-shadow:
        -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-max-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }

    60% {
      box-shadow:
        -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-max-height) $dot-color;
    }

    80% {
      box-shadow:
        -$dot-size * 1.75 ($dot-min-height) $dot-color,
        0 ($dot-min-height) $dot-color,
        $dot-size * 1.75 ($dot-min-height) $dot-color;
    }
  }
}
</style>
