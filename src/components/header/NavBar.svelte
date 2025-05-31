<script lang="ts">
  import type { NeoTabRowItem, OnChange } from '@dvcol/neo-svelte';

  import type { RouteNames } from '~/router/routes';

  import { NeoTabsRow } from '@dvcol/neo-svelte';

  import { router } from '~/router/router';
  import { RouteName } from '~/router/routes';
  import { AuthStore } from '~/stores/authentication.store.svelte';
  import { FeedStore } from '~/stores/feed.store.svelte';

  type TabValue = { id: string; name: RouteNames; index?: number };

  const feedTabs = $derived<NeoTabRowItem<TabValue>[]>(FeedStore.feeds.map((feed, i) => ({
    label: feed.label,
    tabId: feed.id,
    value: {
      id: feed.id,
      name: RouteName.Feed,
      index: i + 2,
    },
  })));

  const tabs = $derived<NeoTabRowItem<TabValue>[]>([
    {
      label: 'Tags',
      tabId: RouteName.Tags,
      value: {
        id: RouteName.Tags,
        name: RouteName.Tags,
        index: 1,
      },
    },
    ...feedTabs,
  ]);

  const active = $derived(router.location?.params?.id);

  const onChange: OnChange<TabValue> = (_, { value } = {}) => {
    const { id, name, index } = value ?? {};
    if (name === undefined) return;
    router.push({ name, meta: { index }, params: { id } });
    if (name !== RouteName.Feed) return;
    FeedStore.active = id;
    void FeedlyService.stream({ id });
  };
</script>

<NeoTabsRow
  tag="nav"
  {tabs}
  {active}
  rounded
  borderless
  disabled={!AuthStore.authenticated}
  elevation={AuthStore.authenticated ? -2 : 0}
  onchange={onChange}
/>
