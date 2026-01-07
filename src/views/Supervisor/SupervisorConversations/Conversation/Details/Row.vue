<template>
  <tr class="details__row">
    <th
      scope="row"
      class="details__row-label"
    >
      {{ label }}
    </th>
    <td class="details__row-data">{{ data }}</td>
  </tr>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  data: string;
}>();
</script>

<style scoped lang="scss">
.details__row {
  text-align: left;

  &:not(:last-of-type) {
    > th,
    > td {
      padding-bottom: $unnnic-space-2;
    }
  }

  &-label {
    padding-right: $unnnic-space-2;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &-data {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;
  }
}
</style>
