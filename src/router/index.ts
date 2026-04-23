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
    redirect: { name: 'agents-team' },
    children: [
      {
        path: '',
        name: 'agents-team',
        component: () => import('@/views/AgentsTeam/MyAgents.vue'),
      },
      {
        path: 'assign',
        name: 'agents-assign',
        component: () => import('@/views/AgentsTeam/AssignAgents.vue'),
      },
      {
        path: 'instructions',
        name: 'instructions',
        component: () => import('@/views/Instructions/index.vue'),
      },
    ],
  },
];

const knowledgeRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATHS.knowledge,
    name: 'knowledge',
    component: () => import('@/views/Knowledge.vue'),
  },
];

const routes: RouteRecordRaw[] = [
  ...conversationsRoutes,
  ...agentsRoutes,
  ...knowledgeRoutes,
  {
    path: '/',
    redirect: MODULE_PATHS.agents,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: MODULE_PATHS.agents,
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

router.afterEach((to) => {
  if (isFederatedModule) {
    return;
  }

  const currentModule = getCurrentModuleFromPath(to.path);

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
