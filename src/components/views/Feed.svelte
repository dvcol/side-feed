<script lang="ts">

  import type { NeoListItemOrSection } from '@dvcol/neo-svelte';

  import { NeoCard, NeoList } from '@dvcol/neo-svelte';
  import { useRoute } from '@dvcol/svelte-simple-router';

  import { FeedStore } from '~/stores/feed.store.svelte';

  const id = $derived(useRoute().location?.params?.id);

  let items = $state<NeoListItemOrSection>();
  $effect(() => {
    if (id === undefined) return;
    items = FeedStore.get(id.toString())?.entries;
  });
</script>

<NeoCard data-id={id} elevation={-2} hover={-1} rounded="lg" flex="1 1 auto" width="-webkit-fill-available" spacing="0.5rem">
  <NeoList {items} dim width="-webkit-fill-available" height="calc(100vh - 7.5rem)" loaderProps={{ description: true, items: 20 }} />
</NeoCard>
