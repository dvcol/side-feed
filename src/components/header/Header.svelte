<script lang="ts">
  import type { RouteNames } from '~/router/routes';

  import { NeoButtonGroup, NeoTab, NeoTabs, NeoThemeSelector } from '@dvcol/neo-svelte';
  import { resolveComponent } from '@dvcol/svelte-utils';

  import { router } from '~/router/router';
  import { routes } from '~/router/routes';

  const active = $derived(router.route?.name);

  const onClick = (id?: RouteNames) => {
    if (id === undefined || id === active) return;
    router.push({ name: id });
  };

  const onHover = async (id?: RouteNames) => {
    if (id === undefined || id === active) return;
    const resolved = await router.resolve({ name: id });
    if (!resolved?.route) return;
    return resolveComponent(resolved.route.component);
  };
</script>

<header>
  <NeoTabs rounded elevation={-2} dim tag="nav" {active} onchange={onClick}>
    {#each routes.filter(r => r.path.length > 2) as { name } (name)}
      <NeoTab tabId={name} onpointerenter={() => onHover(name)}>{name}</NeoTab>
    {/each}
  </NeoTabs>

  <NeoButtonGroup rounded elevation={0} borderless>
    <NeoThemeSelector label={null} rounded />
  </NeoButtonGroup>
</header>

<style lang="scss">
  header {
    display: flex;
    align-items: center;
    justify-content: center;

    :global(> .neo-tabs > nav) {
      margin-bottom: 0.125rem;
    }

    :global(> *:last-child) {
      position: absolute;
      right: 0;
    }
  }
</style>
