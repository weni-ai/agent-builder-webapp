<template>
  <section>
    <template v-if="!credentialList.length">
      <p>
        {{ $t('router.tunings.credentials.no_credentials') }}
      </p>
    </template>

    <template v-else>
      <section v-if="hasCredentialsWithValue">
        <p>
          {{ $t('router.agents_team.drawer.credentials_used_by_this_agent') }}
        </p>

        <section>
          <p
            v-for="credential in credentialsWithValue"
            :key="credential.name"
          >
            {{ credential.label }}
          </p>
        </section>
      </section>

      <template v-if="credentialsWithoutValue.length">
        <p>
          {{ $t('router.agents_team.drawer.description') }}
        </p>

        <UnnnicFormElement
          v-for="credential in credentialsWithoutValue"
          :key="credential.name"
          :label="credential.label"
        >
          <UnnnicInput
            :modelValue="getCredentialValue(credential.name)"
            :placeholder="credential.placeholder || credential.label"
            :nativeType="credential.is_confidential ? 'password' : 'text'"
            @update:model-value="
              tuningsStore.updateCredential({
                ...credential,
                value: $event,
              })
            "
          />
        </UnnnicFormElement>

        <section>
          <p>
            {{
              $t('router.agents_team.drawer.credentials_shared_with_all_agents')
            }}
          </p>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { AgentCredential } from '@/store/types/Agents.types';
import { useTuningsStore } from '@/store/Tunings';

const props = defineProps<{
  credentials: AgentCredential[];
}>();

const tuningsStore = useTuningsStore();

const credentialList = computed(() => props.credentials || []);

const credentialsWithoutValue = computed(() => {
  return credentialList.value.filter((credential) => {
    const [index, type] = tuningsStore.getCredentialIndex(credential.name);
    const value = tuningsStore.initialCredentials?.[type]?.[index]?.value;
    const normalizedValue =
      typeof value === 'string' ? value : value ? String(value) : '';

    return !normalizedValue.trim();
  });
});

const credentialsWithValue = computed(() => {
  const withoutValueNames = credentialsWithoutValue.value.map(
    (cred) => cred.name,
  );

  return credentialList.value.filter((credential) => {
    const value = getCredentialValue(credential.name);
    return value && !withoutValueNames.includes(credential.name);
  });
});

const hasCredentialsWithValue = computed(() => {
  return credentialList.value.some((credential) => {
    const value = getCredentialValue(credential.name);
    return !!value?.trim?.();
  });
});

function getCredentialValue(credentialName: string) {
  const [index, type] = tuningsStore.getCredentialIndex(credentialName);
  const value = tuningsStore.credentials.data?.[type]?.[index]?.value || '';

  return typeof value === 'string' ? value : String(value);
}
</script>
