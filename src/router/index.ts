import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';

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
      },
      {
        path: 'instructions',
        name: 'instructions',
      },
      {
        path: 'agents',
        name: 'agents',
      },
      {
        path: 'knowledge',
        name: 'knowledge',
      },
      {
        path: 'tunings',
        name: 'tunings',
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