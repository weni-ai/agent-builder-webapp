
import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
} from 'vue-router';
import { isFederatedModule } from '@/utils/moduleFederation';
import { RouteRecordRaw } from 'vue-router';

type AgentBuilderModule = 'conversations' | 'agents' | 'build';

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
    path: '/conversations',
    name: 'conversations',
    component: () => import('@/views/Supervisor/index.vue'),
  },
];

const agentsRoutes: RouteRecordRaw[] = [
  {
    path: '/agents',
    name: 'agents',
    component: () => import('@/views/AgentsTeam/index.vue'),
  },
];

const buildRoutes: RouteRecordRaw[] = [
  {
    path: '/build',
    name: 'build',
    redirect: { name: 'instructions' },
    children: [
      {
        path: '/build/instructions',
        name: 'instructions',
        component: () => import('@/views/Instructions/index.vue'),
      },
      {
        path: '/build/knowledge',
        name: 'knowledge',
        component: () => import('@/views/Knowledge.vue'),
      },
      {
        path: '/build/tunings',
        name: 'tunings',
        component: () => import('@/views/Tunings.vue'),
      },
    ]
  },
];

/**
 * Determines which module routes to load based on current path
 */
const getCurrentModuleFromPath = (): AgentBuilderModule => {
  const path = window.location.pathname;
  
  if (path.startsWith('/conversations')) {
    return 'conversations';
  }
  
  if (path.startsWith('/agents')) {
    return 'agents';
  }
  
  return 'build';
};

const currentModule = getCurrentModuleFromPath();

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
