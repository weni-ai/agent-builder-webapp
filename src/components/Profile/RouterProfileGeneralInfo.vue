<template>
  <section class="profile__general-info">
    <section class="general-info__form">
      <LoadingFormElement
        v-if="loading"
        label
      />

      <UnnnicFormElement
        v-else
        class="form__element"
        :label="$t('profile.fields.name.title')"
        :message="$t('profile.fields.name.description')"
        :error="errorRequiredFields.name ? $t('profile.invalid_field') : ''"
      >
        <UnnnicInput
          v-model="profile.name.current"
          data-test="input-name"
          :placeholder="$t('profile.fields.name.placeholder')"
          :type="errorRequiredFields.name ? 'error' : 'normal'"
        />
      </UnnnicFormElement>
    </section>

    <section class="general-info__form">
      <LoadingFormElement
        v-if="loading"
        label
      />

      <UnnnicFormElement
        v-else
        class="form__element"
        :label="$t('profile.fields.occupation.title')"
        :message="$t('profile.fields.occupation.description')"
        :error="errorRequiredFields.role ? $t('profile.invalid_field') : ''"
      >
        <UnnnicInput
          v-model="profile.role.current"
          data-test="input-role"
          :placeholder="$t('profile.fields.occupation.placeholder')"
          :type="errorRequiredFields.role ? 'error' : 'normal'"
        />
      </UnnnicFormElement>
    </section>

    <section class="general-info__form">
      <LoadingFormElement
        v-if="loading"
        label
        element="textarea"
      />

      <UnnnicTextArea
        v-else
        v-model="profile.goal.current"
        data-test="textarea"
        :label="$t('profile.fields.goal.title')"
        :message="$t('profile.fields.goal.description')"
        :error="errorRequiredFields.goal ? $t('profile.invalid_field') : null"
        :placeholder="$t('profile.fields.goal.placeholder')"
        :type="errorRequiredFields.goal ? 'error' : 'normal'"
        :maxLength="500"
      />
    </section>

    <section class="general-info__form">
      <LoadingFormElement
        v-if="loading"
        label
      />

      <UnnnicFormElement
        v-else
        class="form__element"
        :label="$t('profile.fields.personality.title')"
        :message="$t('profile.fields.personality.description')"
        :error="errorRequiredFields.role ? $t('profile.invalid_field') : ''"
      >
        <UnnnicSelectSmart
          data-test="select-personality"
          :modelValue="handlePersonalityValue(profile.personality.current)"
          :options="personalities"
          orderedByIndex
          @update:model-value="profile.personality.current = $event[0].value"
        />
      </UnnnicFormElement>
    </section>
  </section>
</template>

<script>
import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert.js';

import LoadingFormElement from '@/components/LoadingFormElement.vue';

export default {
  components: {
    LoadingFormElement,
  },

  setup() {
    const profileStore = useProfileStore();
    const alertStore = useAlertStore();

    return {
      alertStore,
      profileStore,
    };
  },

  data() {
    return {
      saving: false,
      removing: false,
    };
  },

  computed: {
    personalities() {
      return [
        {
          label: this.$t('profile.fields.personalities.friendly'),
          value: 'Amigável',
        },
        {
          label: this.$t('profile.fields.personalities.cooperative'),
          value: 'Cooperativo',
        },
        {
          label: this.$t('profile.fields.personalities.extrovert'),
          value: 'Extrovertido',
        },
        {
          label: this.$t('profile.fields.personalities.generous'),
          value: 'Generoso',
        },
        {
          label: this.$t('profile.fields.personalities.relaxed'),
          value: 'Relaxado',
        },
        {
          label: this.$t('profile.fields.personalities.organized'),
          value: 'Organizado',
        },
        {
          label: this.$t('profile.fields.personalities.systematic'),
          value: 'Sistemático',
        },
        {
          label: this.$t('profile.fields.personalities.innovative'),
          value: 'Inovador',
        },
        {
          label: this.$t('profile.fields.personalities.creative'),
          value: 'Criativo',
        },
        {
          label: this.$t('profile.fields.personalities.intellectual'),
          value: 'Intelectual',
        },
      ];
    },

    loading() {
      return this.profile.status === 'loading';
    },

    profile() {
      return this.profileStore;
    },

    errorRequiredFields() {
      return this.profile.errorRequiredFields;
    },
  },

  methods: {
    handlePersonalityValue(value) {
      const personality = this.personalities.find((e) => value === e.value);

      return personality ? [personality] : [{ label: '', value: '' }];
    },
  },
};
</script>

<style lang="scss" scoped>
.profile__general-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}
</style>
