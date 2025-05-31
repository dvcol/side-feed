<script lang="ts">
  import type { NeoProgressBarProps } from '@dvcol/neo-svelte';

  import { NeoProgressBar } from '@dvcol/neo-svelte';

  import HeaderProgressProvider from '~/components/header/HeaderProgressProvider.svelte';
  import { AuthStore } from '~/stores/authentication.store.svelte';

  let {
    ref = $bindable(),
    status = $bindable(),
    ...rest
  }: NeoProgressBarProps = $props();
</script>

<NeoProgressBar
  aria-label="Global loading indicator"
  bind:ref
  bind:status
  elevation={AuthStore.authenticated ? -2 : 0}
  track={AuthStore.authenticated}
  borderless
  progress={HeaderProgressProvider}
  {...rest}
/>
