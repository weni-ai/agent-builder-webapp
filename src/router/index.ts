import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';
import { useProjectStore } from '@/store/Project';

const routes = [
  {
    path: '/',
    alias: '/init',
    name: 'home',
    redirect: { name: 'supervisor' },
    children: [
      {
        path: 'supervisor',
        name: 'supervisor',
        component: () => import('@/views/Supervisor/index.vue'),
      },
      {
        path: 'instructions',
        name: 'instructions',
        component: () =>
          import('@/views/Instructions/index.vue'),
      },
      {
        path: 'agents',
        name: 'agents',
        component: () => import('@/views/AgentsTeam/index.vue'),
      },
      {
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
        beforeEnter: async (to, from, next) => {
          const projectStore = useProjectStore();
          if (!projectStore.details.contentBaseUuid) {
            await projectStore.getRouterDetails();
          }
          next();
        },
      },
      {
        path: 'tunings',
        name: 'tunings',
        component: () => import('@/views/Tunings.vue'),
      },
    ]
  },

] as RouteRecordRaw[];


const history = isFederatedModule
  ? createMemoryHistory() // To isolate routing from parent app
  : createWebHistory('/');

const router = createRouter({
  history,
  routes,
});

router.afterEach((router) => {
  delete router.query.next;
  delete router.query.projectUuid;

  window.dispatchEvent(
    new CustomEvent('updateRoute', {
      detail: { path: router.path, query: router.query },
    }),
  );
});

export default router;