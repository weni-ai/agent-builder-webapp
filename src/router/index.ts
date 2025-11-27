import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';
import {
  getCurrentModuleFromPath,
  MODULE_PATHS,
  type AgentBuilderModule,
} from '@/composables/useCurrentModule';

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

const conversationsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATHS.conversations,
    name: 'conversations',
    component: () => import('@/views/Supervisor/index.vue'),
  },
];

const agentsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATHS.agents,
    name: 'agents',
    component: () => import('@/views/AgentsTeam/index.vue'),
  },
];

const buildRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATHS.build,
    name: 'build',
    redirect: { name: 'instructions' },
    children: [
      {
        path: 'instructions',
        name: 'instructions',
        component: () => import('@/views/Instructions/index.vue'),
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
];

const currentModule =
  getCurrentModuleFromPath(window.location.pathname) || 'build';

const moduleRoutesMap: Record<AgentBuilderModule, RouteRecordRaw[]> = {
  conversations: conversationsRoutes,
  agents: agentsRoutes,
  build: buildRoutes,
};

const routes: RouteRecordRaw[] = [
  ...moduleRoutesMap[currentModule],
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: { name: currentModule },
  },
];

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

router.afterEach((_to, _from) => {
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
