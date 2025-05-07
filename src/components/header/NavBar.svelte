<script lang="ts">
  import type { NeoMenuItem, OnChange } from '@dvcol/neo-svelte';

  import type { RouteNames } from '~/router/routes';

  import { NeoButton, NeoIconBouncingDots, NeoMenu, NeoTab, NeoTabs } from '@dvcol/neo-svelte';
  import { resolveComponent } from '@dvcol/svelte-utils/component';
  import { onMount, tick } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';

  import { router } from '~/router/router';
  import { RouteName } from '~/router/routes';
  import { FeedlyService } from '~/services/feedly.service';
  import { AuthStore } from '~/stores/authentication.store.svelte';
  import { FeedStore } from '~/stores/feed.store.svelte';

  type TabValue = { label: string; name: RouteNames; index?: number };
  type Tab = { id: RouteNames; value: TabValue };
  const tabs = $derived<Tab[]>(
    [
      {
        id: RouteName.Tags,
        value: {
          label: 'Tags',
          name: RouteName.Tags,
          index: 1,
        },
      },
      ...FeedStore.feeds.map((feed, i) => ({
        id: feed.id,
        value: {
          label: feed.label,
          name: RouteName.Feed,
          index: i + 2,
        },
      })),
    ],
  );

  const active = $derived(router.location?.params?.id);

  const onChange: OnChange<TabValue> = (id, { value: { name, index } = {} } = {}) => {
    if (name === undefined) return;
    router.push({ name, meta: { index }, params: { id } });
    if (name !== RouteName.Feed) return;
    FeedStore.active = id;
    void FeedlyService.stream({ id });
  };

  const onHover = async (id?: RouteNames) => {
    if (id === undefined || id === active) return;
    const resolved = await router.resolve({ name: id });
    if (!resolved?.route) return;
    return resolveComponent(resolved.route.component);
  };

  const collapsed = new SvelteMap<Tab['id'], Tab>();
  const visible = $derived(tabs?.filter(t => !collapsed.has(t.id)));
  const items = $derived(Array.from(collapsed?.values()).map(t => ({
    id: t.id,
    label: t.value?.label ?? t.value?.name,
    value: t.value,
  }) satisfies NeoMenuItem));

  $inspect(items).with((update, item) => console.info(update, Array.from(item)));

  let ref = $state();

  // Move this to NeoButtonGroup, adds menu dropdown, adds animated dot icon
  // Watch container resize
  onMount(async () => {
    while (ref.firstElementChild.scrollWidth > ref.firstElementChild.clientWidth) {
      collapsed.set(visible.at(-1)?.id, visible.at(-1));
      await tick();
    }
  });

  let hovered = $state(false);
  let focused = $state(false);
</script>

<NeoTabs
  bind:ref
  tag="nav"
  {active}
  rounded
  borderless
  disabled={!AuthStore.authenticated}
  elevation={AuthStore.authenticated ? -2 : 0}
  onchange={onChange}
  nowrap
>
  {#each visible as { id, value } (id)}
    <NeoTab tabId={id} {value} onpointerenter={() => onHover(value?.name)}>
      {value?.label ?? value?.name}
    </NeoTab>
  {/each}
  <NeoMenu {items}>
    <NeoButton bind:hovered bind:focused>
      {#snippet icon()}
        <NeoIconBouncingDots bounce={hovered || focused} />
      {/snippet}
    </NeoButton>
  </NeoMenu>
</NeoTabs>
