<script lang="ts">
  import type { NeoListItemContext, NeoListItemOrSection } from '@dvcol/neo-svelte';

  import type { Feed } from '~/models/feed.model';

  import { randomInt } from '@dvcol/common-utils/common/math';
  import { NeoButton, NeoCard, NeoIconWatch, NeoIconWatchOff, NeoList, NeoListSearch } from '@dvcol/neo-svelte';
  import { useRoute } from '@dvcol/svelte-simple-router';
  import { innerWidth } from 'svelte/reactivity/window';

  import { FeedlyService } from '~/services/feedly.service';
  import { FeedStore } from '~/stores/feed.store.svelte';

  const id = $derived(useRoute().location?.params?.id);

  const feed = $derived<Feed>(FeedStore.get(id?.toString()));
  const items = $derived<NeoListItemOrSection>(feed?.entries);

  // TODO - debounce loading
  const loading = $derived(!!FeedStore.loading(id?.toString()));
  const pagination = $derived(FeedStore.pagination);

  const onScrollBottom = $derived(() => {
    console.info('onScrollBottom');
    if (!id || loading || !feed.next) return;
    return FeedlyService.stream({ id: id.toString() }, { next: true });
  });

  // TODO : mark as read
  // TODO : Open content in a side panel
  // TODO : floating action
  // TODO : pull to refresh
  // TODO : search fly in/out
  // TODO : sonner toasts

  const lines = $derived.by(() => {
    if (innerWidth.current < 600) return 2;
    if (innerWidth.current < 800) return 3;
    if (innerWidth.current < 1000) return 4;
    if (innerWidth.current < 1200) return 5;
    return 10;
  });

</script>

{#snippet buttons({ item }: NeoListItemContext)}
  <NeoButton elevation="0">
    {#snippet icon()}
      {#if item.read}
        <NeoIconWatch />
      {:else}
        <NeoIconWatchOff />
      {/if}
    {/snippet}
  </NeoButton>
{/snippet}

<NeoCard
  data-id={id}
  elevation={-2}
  hover={-1}
  rounded="lg"
  flex="1 1 auto"
  width="-webkit-fill-available"
  spacing="0.5rem"
>
  {#snippet children(cardContext)}
    <div class="side-feed-list">
      <NeoList
        {items}
        {loading}
        {onScrollBottom}
        itemProps={{
          rounded: 'lg',
          ellipsis: { label: 2, description: lines },
          mediaProps: {
            ratio: '16/10',
            rounded: 'md',
            image: {
              rounded: false,
              fit: 'cover',
              loading: 'lazy',
            },
          },
          markProps: {
            html: {
              ALLOWED_TAGS: ['mark'],
            },
          },
          after: buttons,
        }}
        loaderProps={{
          description: true,
          items: pagination,
          lines,
          header: 1,
          media: true,
          mediaProps: {
            ratio: '16/10',
            type: 'image',
            skeletonMediaProps: {
              rounded: 'md',
            },
          },
          width: `${randomInt(80, 100)}%`,
        }}
        width="-webkit-fill-available"
        height="calc(100vh - 7.5rem)"
        dim
      >
        {#snippet before(context)}
          <NeoListSearch
            elevation={(cardContext.hovered || cardContext.focused) ? 3 : 1}
            {context}
            glass
            sort={false}
          />
        {/snippet}
      </NeoList>
    </div>
  {/snippet}
</NeoCard>

<style lang="scss">
  .side-feed-list {
    display: contents;

    :global(.neo-list-loader),
    :global(.neo-list-item) {
      container-type: inline-size;
      container-name: feed-list-item;

      --neo-list-item-button-padding: 0.5rem;
    }

    :global(.neo-list-base-loader-media),
    :global(.neo-list-item-media) {
      max-width: 100%;
      transform-origin: top left;
      opacity: 1;
      transition:
        scale 0.5s linear,
        opacity 0.5s linear,
        padding 0.5s ease,
        margin 0.5s ease,
        max-width 0.5s ease,
        box-shadow 0.15s ease,
        border-color 0.15s ease,
        display 0.6s;
      will-change: scale, opacity, margin, padding, max-width, display;
      transition-behavior: allow-discrete;
      interpolate-size: allow-keywords;
      scale: 1;
    }

    @container feed-list-item (width <= 500px) {
      :global(.neo-list-loader .neo-list-base-loader-content),
      :global(.neo-list-item .neo-list-item-content) {
        gap: 0;
      }

      :global(.neo-list-base-loader-media),
      :global(.neo-list-item-media) {
        display: none;
        max-width: 0;
        margin: 0;
        padding: 0;
        opacity: 0;
      }
    }
  }

</style>
