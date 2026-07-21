<template>
  <section :class="`sites__container sites__container--shape-${$props.shape}`">
    <section
      v-if="$props.items.data.length === 0 && $props.shape !== 'accordion'"
      class="sites__content--empty"
    >
      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-darkest"
        size="body-lg"
        weight="bold"
        marginBottom="sm"
        data-test="label-title"
      >
        {{ $t('content_bases.sites.title') }}
      </UnnnicIntelligenceText>

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        color="neutral-cloudy"
        size="body-gt"
        marginBottom="sm"
        data-test="label-description"
      >
        {{ $t('content_bases.sites.description') }}
      </UnnnicIntelligenceText>

      <UnnnicButton
        size="small"
        type="primary"
        class="sites__content__button-add-site"
        @click="openAddSite"
      >
        {{ $t('content_bases.sites.add_site') }}
      </UnnnicButton>
    </section>

    <ContentList
      v-else
      :items="$props.items"
      :shape="$props.shape"
      :subDescription="$t('content_bases.sites.description')"
      :description="$t('content_bases.sites.title')"
      :addText="$t('content_bases.sites.add_site')"
      defaultIcon="globe"
      columns="1, 1fr"
      @add="openAddSite"
      @remove="onRemove"
    />

    <ModalAddSite
      v-if="isAddSiteOpen"
      v-model="isAddSiteOpen"
      @close="closeAddSite"
      @added-site="addedSites"
    />

    <UnnnicDialog
      data-testid="modal-remove-site"
      :open="!!modalDeleteSite"
      lazyMount
      @update:open="onDeleteSiteModalOpenUpdate"
    >
      <UnnnicDialogContent v-if="modalDeleteSite">
        <UnnnicDialogHeader type="warning">
          <UnnnicDialogTitle>
            {{ $t('content_bases.sites.delete_site.title') }}
          </UnnnicDialogTitle>
        </UnnnicDialogHeader>

        <i18n-t
          tag="p"
          class="delete-site-modal__description"
          keypath="content_bases.sites.delete_site.description"
        >
          <template #name>
            <b>{{ modalDeleteSite.name }}</b>
          </template>
        </i18n-t>

        <UnnnicDialogFooter>
          <UnnnicDialogClose>
            <UnnnicButton
              data-testid="button-cancel"
              :text="$t('content_bases.sites.delete_site.cancel')"
              type="tertiary"
              :disabled="modalDeleteSite.status === 'deleting'"
              @click="closeModal"
            />
          </UnnnicDialogClose>

          <UnnnicButton
            data-testid="button-remove"
            :text="$t('content_bases.sites.delete_site.delete')"
            type="warning"
            :loading="modalDeleteSite.status === 'deleting'"
            @click="remove"
          />
        </UnnnicDialogFooter>
      </UnnnicDialogContent>
    </UnnnicDialog>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import ModalAddSite from '@/components/Knowledge/ContentBase/ModalAddSite.vue';
import ContentList from '@/components/Knowledge/ContentBase/ContentList.vue';
import i18n from '@/utils/plugins/i18n';
import { useAlertStore } from '@/store/Alert';

const props = defineProps({
  items: {
    type: Object,
    default: () => {},
  },
  shape: {
    type: String,
    default: 'accordion',
  },
});

const isAddSiteOpen = ref(false);
const modalDeleteSite = ref(null);
const alertStore = useAlertStore();

const openAddSite = () => {
  isAddSiteOpen.value = true;
};

const closeAddSite = () => {
  isAddSiteOpen.value = false;
};

const onRemove = ({ uuid, created_file_name, status }) => {
  if (['fail-upload'].includes(status)) {
    props.items.removeItem({ uuid });
  } else {
    openDeleteSite(uuid, created_file_name || '');
  }
};

const addedSites = (site) => {
  props.items.addItem(site);
};

const openDeleteSite = (siteUuid, siteURL) => {
  modalDeleteSite.value = {
    uuid: siteUuid,
    name: siteURL,
    status: null,
  };
};

const closeModal = () => {
  if (modalDeleteSite.value?.status === 'deleting') return;
  modalDeleteSite.value = null;
};

const onDeleteSiteModalOpenUpdate = (open) => {
  if (!open) closeModal();
};

const remove = () => {
  modalDeleteSite.value.status = 'deleting';

  nexusaiAPI.knowledge.sites
    .delete({
      linkUuid: modalDeleteSite.value.uuid,
    })
    .then(() => {
      alertStore.add({
        type: 'informational',
        text: i18n.global.t('content_bases.files.file_removed_from_base', {
          name: modalDeleteSite.value.name,
        }),
      });

      props.items.removeItem({ uuid: modalDeleteSite.value.uuid });
    })
    .finally(() => {
      modalDeleteSite.value = null;
    });
};
</script>

<style lang="scss" scoped>
.delete-site-modal {
  &__description {
    margin: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;

    :deep(b) {
      font-weight: $unnnic-font-weight-bold;
    }
  }
}

.sites {
  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;

    &--shape-normal {
      height: 100%;
    }
  }

  &__content {
    &--empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &__button-add-site {
      width: 12.5 * $unnnic-font-size;
    }
  }
}
</style>
