import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';
import { useProjectStore } from '@/store/Project';

const parseNextPath = (nextPath, to) => {
  const [path, queryString] = nextPath.split('?');
  const query = { ...to.query };

  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
      query[key] = value;
    }
  }

  delete query.next;
  delete query.next_from_redirect;

  return { path, query };
};

const routes = [
  {
    path: '/',
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
        component: () => import('@/views/Instructions/index.vue'),
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
      },
      {
        path: 'tunings',
        name: 'tunings',
        component: () => import('@/views/Tunings.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: { name: 'supervisor' },
  },
] as RouteRecordRaw[];

const history = isFederatedModule
  ? createMemoryHistory() // To isolate routing from parent app
  : createWebHistory('/');

const router = createRouter({
  history,
  routes,
});

router.beforeEach((to, from, next) => {
  const nextPath = to.query.next;

  if (nextPath) {
    next(parseNextPath(nextPath as string, to));
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  window.parent.postMessage(
    {
      event: 'changePathname',
      pathname: window.location.pathname,
    },
    '*',
  );
});

export default router;
