
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';
import {
  getCurrentModule,
  setModule,
  type AgentBuilderModule,
} from '@/utils/modules';

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

const getNotFoundRoute = (name: string) => {
  return {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: { name },
  };
};

const conversationsRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'conversations',
    component: () => import('@/views/Supervisor/index.vue'),
  },
  {
    ...getNotFoundRoute('conversations'),
  },
];

const agentsRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'agents',
    component: () => import('@/views/AgentsTeam/index.vue'),
  },
  {
    ...getNotFoundRoute('agents'),
  },
];

const buildRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'build',
    redirect: { name: 'instructions' },
  },
  {
    path: '/instructions',
    name: 'instructions',
    component: () => import('@/views/Instructions/index.vue'),
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('@/views/Knowledge.vue'),
  },
  {
    path: '/tunings',
    name: 'tunings',
    component: () => import('@/views/Tunings.vue'),
  },
  {
    ...getNotFoundRoute('build'),
  },
];

const moduleRoutesMap: Record<AgentBuilderModule, RouteRecordRaw[]> = {
  conversations: conversationsRoutes,
  agents: agentsRoutes,
  build: buildRoutes,
};

const currentModule = getCurrentModule();
const routes = moduleRoutesMap[currentModule] || buildRoutes;

setModule(currentModule);

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
      module: currentModule,
    },
    '*',
  );
});

export default router;
