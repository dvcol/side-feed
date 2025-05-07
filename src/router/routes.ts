import type { NavigationGuard, Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

import { AuthStore } from '~/stores/authentication.store.svelte';
import { FeedStore } from '~/stores/feed.store.svelte';

export const RouteName = {
  Home: 'home',
  Tags: 'tags',
  Feed: 'feed',
  Login: 'login',
  Settings: 'settings',
  Any: 'any',
} as const;

export type RouteNames = (typeof RouteName)[keyof typeof RouteName];

const authGuard: NavigationGuard<RouteNames> = async () => {
  if (AuthStore.authenticated) return;
  return { name: RouteName.Login };
};

export const routes: Readonly<Route<RouteNames>[]> = [
  {
    name: RouteName.Home,
    path: '/',
    redirect: {
      name: RouteName.Feed,
      params: {
        id: FeedStore.active,
      },
    },
  },
  {
    name: RouteName.Login,
    path: `/${RouteName.Login}`,
    component: async () => import('~/components/views/Login.svelte'),
    beforeEnter: async () => {
      if (AuthStore.authenticated) return { name: RouteName.Settings };
    },
    meta: {
      index: 0,
    },
  },
  {
    name: RouteName.Tags,
    path: `/${RouteName.Tags}`,
    component: async () => import('~/components/views/Feed.svelte'),
    beforeEnter: authGuard,
    meta: {
      index: 1,
      header: true,
    },
  },
  {
    name: RouteName.Feed,
    path: `/${RouteName.Feed}/:id:?`,
    component: async () => import('~/components/views/Feed.svelte'),
    beforeEnter: authGuard,
    meta: {
      index: 2,
      header: true,
    },
  },
  {
    name: RouteName.Settings,
    path: `/${RouteName.Settings}`,
    component: async () => import('~/components/views/Settings.svelte'),
    beforeEnter: authGuard,
    meta: {
      index: Infinity,
    },
  },
  {
    name: RouteName.Any,
    path: '*',
    redirect: {
      name: RouteName.Feed,
      params: {
        id: FeedStore.active,
      },
    },
  },
] as const;

export const options: RouterOptions<RouteNames> = {
  hash: true,
  routes,
} as const;
