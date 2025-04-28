import type { Route, RouterOptions } from '@dvcol/svelte-simple-router/models';

export const RouteName = {
  Home: 'home',
  Feed: 'feed',
  Settings: 'settings',
  Any: 'any',
} as const;

export type RouteNames = (typeof RouteName)[keyof typeof RouteName];

export const routes: Readonly<Route<RouteNames>[]> = [
  {
    name: RouteName.Home,
    path: '/',
    redirect: {
      name: RouteName.Feed,
    },
  },
  {
    name: RouteName.Feed,
    path: `/${RouteName.Feed}`,
    component: async () => import('~/components/views/Feed.svelte'),
    meta: {
      index: 1,
    },
  },
  {
    name: RouteName.Settings,
    path: `/${RouteName.Settings}`,
    component: async () => import('~/components/views/Settings.svelte'),
    meta: {
      index: 2,
    },
  },
  {
    name: RouteName.Any,
    path: '*',
    redirect: {
      name: RouteName.Feed,
    },
  },
] as const;

export const options: RouterOptions<RouteNames> = {
  hash: true,
  routes,
} as const;
