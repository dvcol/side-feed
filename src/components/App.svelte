<script lang="ts">
  import type { AppProps } from '~/components/app.model';

  import { NeoLazy, NeoPortalContainer, NeoSuspense, NeoThemeProvider } from '@dvcol/neo-svelte';
  import { onMount } from 'svelte';

  import { Logger } from '~/services/logger.service';
  import { initServices } from '~/web/init-services';

  const {
    baseUrl,
    view,
  }: AppProps = $props();

  onMount(() => {
    Logger.info('baseUrl:', baseUrl);
  });

</script>

<NeoThemeProvider target="self">
  <NeoPortalContainer>
    <NeoSuspense promise={initServices(view)}>
      <NeoLazy component={import('~/components/header/Header.svelte')} />
      <NeoLazy component={import('~/components/main/Main.svelte')} />
    </NeoSuspense>
  </NeoPortalContainer>
</NeoThemeProvider>
