<template>
  <UnnnicModalDialog
    class="agents-gallery-modal"
    :modelValue="agentsTeamStore.isAgentsGalleryOpen"
    showCloseIcon
    showActionsDivider
    :title="$t('router.agents_team.gallery.title')"
    size="lg"
    data-testid="agents-gallery-modal"
    @update:model-value="closeModal"
  >
    <section
      class="agents-gallery"
      data-testid="agents-gallery"
    >
      <SidebarMenu
        class="agents-gallery__sidebar"
        data-testid="sidebar-menu"
      >
        <SideBarItem
          v-for="tab in contentTabs"
          :key="tab.page"
          class="sidebar__item"
          :text="$t(`router.agents_team.gallery.${tab.title}`)"
          :active="tab.page === activeTab"
          :iconFilled="tab.page === activeTab"
          data-testid="sidebar-item"
          @click="onTabChange(tab.page)"
        />
      </SidebarMenu>

      <section class="agents-gallery__content">
        <UnnnicInput
          v-if="!isMyAgentsEmpty"
          v-model="search[activeTab]"
          iconLeft="search"
          :placeholder="$t('router.agents_team.gallery.search_placeholder')"
          data-testid="search-input"
        />

        <section
          v-if="activeTab === 'my-agents'"
          data-testid="custom-agents-section"
          :class="[
            'agents-gallery__custom-agents',
            {
              'agents-gallery__custom-agents--empty': isMyAgentsEmpty,
            },
          ]"
        >
          <UnnnicIntelligenceText
            tag="p"
            family="secondary"
            size="body-gt"
            color="neutral-cloudy"
          >
            {{ $t('router.agents_team.gallery.custom_agents_description') }}
          </UnnnicIntelligenceText>

          <!-- This comment prevents from auto-capitalizing i18n-t to I18nT which would break the component -->
          <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
          <i18n-t
            class="custom-agents__description"
            keypath="router.agents_team.gallery.weni_cli_documentation_description"
            tag="p"
          >
            <template #weni_cli_documentation>
              <p
                class="description__link"
                data-testid="weni-cli-documentation-link"
                @click="openCLI"
              >
                {{ $t('router.agents_team.gallery.weni_cli_documentation') }}
              </p>
            </template>
          </i18n-t>
        </section>

        <template v-if="!isMyAgentsEmpty">
          <section
            :class="[
              'content__cards',
              {
                'content__cards--empty': isMyAgentsEmpty,
              },
            ]"
          >
            <template v-if="isLoadingAgents">
              <AssignAgentCard
                v-for="n in 3"
                :key="n"
                loading
                data-testid="agent-card-loading"
              />
            </template>

            <template v-else>
              <UnnnicIntelligenceText
                v-if="isSearchEmpty"
                color="neutral-clean"
                family="secondary"
                size="body-gt"
                tag="p"
                data-testid="no-agent-found"
              >
                {{ $t('router.agents_team.gallery.no_agent_found') }}
              </UnnnicIntelligenceText>

              <template v-else>
                <AssignAgentCard
                  v-for="agent in agentsData"
                  :key="agent.uuid"
                  :agent="agent"
                  data-testid="agent-card"
                  @agent-assigned="closeModal"
                />
              </template>
            </template>
          </section>
        </template>
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { debounce } from 'lodash';

import AssignAgentCard from '@/components/AgentsTeam/AssignAgentCard.vue';
import SideBarItem from '@/components/Sidebar/SideBarItem.vue';
import SidebarMenu from '@/components/Sidebar/SidebarMenu.vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();
const officialAgents = agentsTeamStore.officialAgents;
const myAgents = agentsTeamStore.myAgents;

const contentTabs = ref([
  { title: 'official_agents', page: 'official' },
  { title: 'custom_agents', page: 'my-agents' },
]);
const activeTab = ref(contentTabs.value[0].page);
const search = ref({
  official: '',
  'my-agents': '',
});
const isSearchEmpty = ref(false);

const agentsData = computed(() =>
  activeTab.value === 'official' ? officialAgents.data : myAgents.data,
);
const isLoadingAgents = computed(
  () => officialAgents.status === 'loading' || myAgents.status === 'loading',
);
const isMyAgentsEmpty = computed(
  () =>
    activeTab.value === 'my-agents' &&
    myAgents.data.length === 0 &&
    !isSearchEmpty.value &&
    !isLoadingAgents.value,
);

function updateSearchEmpty() {
  const currentAgents = agentsData.value;
  const currentSearch = search.value[activeTab.value];

  isSearchEmpty.value =
    currentSearch.trim() !== '' && currentAgents.length === 0;
}

function onTabChange(newTab) {
  activeTab.value = newTab;

  updateSearchEmpty();
}

function closeModal() {
  agentsTeamStore.isAgentsGalleryOpen = false;
}

function openCLI() {
  window.open(agentsTeamStore.linkToCreateAgent, '_blank');
}

const debouncedSearch = (callback) => debounce(callback, 300);
watch(
  () => search.value['my-agents'],
  debouncedSearch(async (search) => {
    await agentsTeamStore.loadMyAgents({ search });
    updateSearchEmpty();
  }),
);
watch(
  () => search.value['official'],
  debouncedSearch(async (search) => {
    await agentsTeamStore.loadOfficialAgents({ search });
    updateSearchEmpty();
  }),
);
</script>

<style lang="scss" scoped>
.agents-gallery-modal {
  :deep(.unnnic-modal-dialog__container) {
    width: 75vw;
    height: 85vh;
  }

  .agents-gallery {
    height: 100%;

    display: grid;
    grid-template-columns: 170px 1fr;
    gap: $unnnic-spacing-sm;

    &__sidebar {
      .sidebar__item {
        padding: $unnnic-spacing-ant;
      }
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;

      .content__cards {
        margin-bottom: $unnnic-spacing-sm;

        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: $unnnic-spacing-sm;

        &--empty {
          grid-template-columns: repeat(1, 1fr);
        }
      }
    }

    &__custom-agents {
      height: fit-content;

      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: $unnnic-spacing-nano;

      &--empty {
        flex-direction: column;
        justify-content: center;

        width: 100%;
        height: 100%;
      }

      .custom-agents__description {
        display: flex;
        align-items: center;
        gap: $unnnic-spacing-nano;

        font-size: $unnnic-font-size-body-gt;

        .description__link {
          position: relative;

          font-size: $unnnic-font-size-body-gt;
          color: $unnnic-color-neutral-cloudy;
          font-weight: $unnnic-font-weight-bold;

          cursor: pointer;

          &::after {
            content: '';

            position: absolute;
            bottom: 0;
            left: 0;

            width: 100%;
            height: 1px;

            background-color: $unnnic-color-neutral-cloudy;
          }
        }
      }
    }
  }
}
</style>
