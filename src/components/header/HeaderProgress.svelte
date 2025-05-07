<script lang="ts">
  import type { NeoProgressBarProps, NeoProgressHTMLElement } from '@dvcol/neo-svelte';

  import { NeoProgressBar } from '@dvcol/neo-svelte';

  import { LoadingService } from '~/services/loading.service';
  import { AuthStore } from '~/stores/authentication.store.svelte';

  let {
    ref = $bindable(),
    status = $bindable(),
    ...rest
  }: NeoProgressBarProps = $props();

  $effect(() => {
    if (!ref) return;
    LoadingService.init(ref as NeoProgressHTMLElement);
    return () => LoadingService.destroy();
  });
</script>

<NeoProgressBar
  aria-label="Global loading indicator"
  bind:ref
  bind:status
  elevation={AuthStore.authenticated ? -2 : 0}
  track={AuthStore.authenticated}
  borderless
  {...rest}
/>
