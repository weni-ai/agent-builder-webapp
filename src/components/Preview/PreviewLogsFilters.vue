<template>
  <section
    v-if="logs.length > 0"
    class="preview-logs-filters"
    data-testid="preview-logs-filters"
  >
    <header class="filters__header">
      <button
        :class="{ 'header__filter-button--expanded': showFilters }"
        class="header__filter-button"
        data-testid="filter-logs-button"
        @click="toggleFilters"
      >
        <UnnnicIntelligenceText
          color="neutral-clean"
          family="secondary"
          size="body-gt"
        >
          {{ $t('agent_builder.traces.filter_logs.title') }}
        </UnnnicIntelligenceText>

        <UnnnicIcon
          class="filter-button__icon"
          data-testid="filter-logs-icon"
          icon="keyboard_arrow_down"
          scheme="neutral-clean"
          size="avatar-nano"
          :class="{ 'filter-button__icon--expanded': showFilters }"
        />
      </button>
    </header>

    <Transition name="filters-slide">
      <section
        v-show="showFilters"
        data-testid="filter-logs-fields"
        class="filters__fields"
      >
        <UnnnicInput
          v-model="searchTerm"
          :placeholder="$t('agent_builder.traces.filter_logs.placeholder')"
          data-testid="logs-search-input"
          iconLeft="search"
          class="search__input"
        />

        <UnnnicSelectSmart
          v-model:modelValue="selectedCategories"
          :options="categoryOptions"
          autocomplete
          autocompleteClearOnFocus
          multiple
          data-testid="logs-category-filter"
        />
      </section>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { debounce } from 'lodash';
import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  logs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['filters-changed']);

const searchTerm = ref('');
const selectedCategories = ref([]);
const showFilters = ref(false);

const categoryOptions = computed(() => {
  const categories = [
    'knowledge',
    'thinking',
    'delegating_to_agent',
    'forwarding_to_manager',
    'tool',
    'sending_final_response',
    'sending_response_for_manager',
    'applying_guardrails',
  ];

  const placeholder = {
    value: '',
    label: i18n.global.t(
      'agent_builder.traces.filter_logs.categories.placeholder',
    ),
  };

  return [
    placeholder,
    ...categories.map((category) => ({
      value: category,
      label: i18n.global.t(
        `agent_builder.traces.filter_logs.categories.${category}`,
      ),
    })),
  ];
});

function toggleFilters() {
  showFilters.value = !showFilters.value;
}

function emitFiltersChanged() {
  emit('filters-changed', {
    searchTerm: searchTerm.value,
    selectedCategories: selectedCategories.value.map(
      (category) => category.value,
    ),
  });
}

watch(
  () => searchTerm.value,
  debounce(() => {
    emitFiltersChanged();
  }, 300),
);

watch(
  () => selectedCategories.value,
  () => emitFiltersChanged(),
  { deep: true },
);

watch(
  () => props.logs,
  () => emitFiltersChanged(),
);
</script>

<style lang="scss" scoped>
.preview-logs-filters {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;

  .filters__header {
    .header__filter-button {
      border: none;
      background: none;
      padding: 0;

      cursor: pointer;

      display: flex;
      align-items: center;
      gap: $unnnic-spacing-nano;

      .filter-button__icon {
        transition: transform 0.2s ease;

        &--expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  .filters__fields {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;

    z-index: 100;

    .filters__search,
    .filters__categories {
      .search__input {
        width: 100%;
      }
    }
  }
}

.filters-slide-enter-from {
  transition: all 0.5s ease;
  transform: translateY(-5px);
  max-height: 0;
  opacity: 0;
}

.filters-slide-enter-active {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.filters-slide-enter-to,
.filters-slide-leave-from {
  max-height: 200px;
  opacity: 1;
}

.filters-slide-leave-active {
  transition: all 0.3s ease;
  transform: translateY(0);
  opacity: 0;
}

.filters-slide-leave-to {
  transform: translateY(-5px);
  transition: all 0.5s ease;
  max-height: 0;
}
</style>
