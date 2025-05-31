<script lang="ts">
  import type { NeoIconProps } from '@dvcol/neo-svelte';

  import { NeoIconCircleLoading, NeoIconRefresh } from '@dvcol/neo-svelte';

  import { LoadingService } from '~/services/loading.service.svelte';

  const { loading, ...rest }: NeoIconProps & { loading?: boolean } = $props();

  const isLoading = $derived(loading ?? LoadingService.loading);
</script>

{#if isLoading}
  <NeoIconCircleLoading {...rest} />
{:else}
  <NeoIconRefresh {...rest} />
{/if}
