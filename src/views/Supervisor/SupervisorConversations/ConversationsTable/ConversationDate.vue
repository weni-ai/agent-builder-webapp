<template>
  <UnnnicIntelligenceText
    data-testid="conversation-date"
    tag="p"
    color="neutral-cloudy"
    family="secondary"
    size="body-gt"
  >
    {{ formattedDate }}
  </UnnnicIntelligenceText>
</template>

<script setup>
import { format } from 'date-fns';

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
});
const formattedDate = `${format(new Date(props.date), 'dd/MM/yyyy')} ${format(new Date(props.date), 'HH:mm')}`;
</script>
