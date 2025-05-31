<script lang="ts">
  import type { NeoMenuItem } from '@dvcol/neo-svelte';

  import { NeoButton, NeoButtonGroup, NeoIconCog, NeoIconTheme, NeoIconUnplug, NeoMenu, NeoTheme, useNeoThemeContext } from '@dvcol/neo-svelte';

  import IconRefresh from '~/components/icons/IconRefresh.svelte';
  import { router } from '~/router/router';
  import { RouteName } from '~/router/routes';
  import { FeedlyService } from '~/services/feedly.service';
  import { AuthStore } from '~/stores/authentication.store.svelte';
  import { FeedStore } from '~/stores/feed.store.svelte';
  import { useI18n } from '~/utils/i18n.utils';

  const i18n = useI18n('header_nav_menu');

  const checked = $derived(router.route?.name === RouteName.Settings);

  const onClick = async () => router.push({ name: RouteName.Settings });

  const context = useNeoThemeContext();
  const dark = $derived(context.theme === NeoTheme.Dark);
  const onTheme = () => context.update({ theme: dark ? NeoTheme.Light : NeoTheme.Dark });

  const onRefresh = async () => {
    if (FeedStore.active === undefined) return;
    await FeedlyService.stream({ id: FeedStore.active }, { force: true });
  };

  const items: NeoMenuItem[] = [
    {
      value: 'Settings',
      divider: true,
      section: true,
      sticky: true,
      items: [
        { label: i18n('refresh', 'buttons'), onclick: onRefresh, keepOpenOnSelect: true, before: IconRefresh },
        { label: i18n('settings', 'buttons'), onclick: () => router.push({ name: RouteName.Settings }), before: NeoIconCog },
        { label: i18n(`${context.theme}_mode`, 'buttons'), onclick: onTheme, keepOpenOnSelect: true, before: NeoIconTheme },
      ],
    },
    {
      value: 'Auth',
      divider: true,
      section: true,
      sticky: true,
      items: [
        { label: i18n('logout', 'buttons'), onclick: FeedlyService.logout, keepOpenOnSelect: true, before: NeoIconUnplug },
      ],
    },
  ];
</script>

<NeoButtonGroup rounded elevation={0} borderless --neo-btn-group-gap="0">
  <NeoButton onclick={onRefresh}>
    {#snippet icon()}
      <IconRefresh />
    {/snippet}
  </NeoButton>
  {#if AuthStore.profile}
    <NeoMenu {items} placement="bottom-end" reverse disabled={!AuthStore.authenticated} blur="5">
      <NeoButton onclick={onClick} reverse {checked} style="min-width: max-content;">
        {AuthStore.profile.givenName}
        {#snippet icon()}
          <img src={AuthStore.profile.picture} alt="Github" width="24" height="24" style="border-radius: 50%" />
        {/snippet}
      </NeoButton>
    </NeoMenu>
  {/if}
</NeoButtonGroup>
