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
        <ToneOfVoiceRadios
          :selectedTone="profile.personality.current"
          @update:selected-tone="profile.personality.current = $event"
        />
      </UnnnicFormElement>
    </section>
  </section>
</template>

<script setup lang="ts">
import { useProfileStore } from '@/store/Profile';

import LoadingFormElement from '@/components/LoadingFormElement.vue';
import ToneOfVoiceRadios from './ToneOfVoiceRadios.vue';
import { computed } from 'vue';

const profileStore = useProfileStore();

const loading = computed(() => profileStore.status === 'loading');
const profile = computed(() => profileStore);
const errorRequiredFields = computed(() => profileStore.errorRequiredFields);
</script>

<style lang="scss" scoped>
.profile__general-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}
</style>
