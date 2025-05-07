<script lang="ts">
  import type { NeoMenuItem } from '@dvcol/neo-svelte';

  import { NeoButton, NeoButtonGroup, NeoIconCog, NeoIconRefresh, NeoIconTheme, NeoIconUnplug, NeoMenu, NeoTheme, useNeoThemeContext } from '@dvcol/neo-svelte';

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
    await FeedlyService.stream({ id: FeedStore.active }, true);
  };

  const items: NeoMenuItem[] = [
    {
      value: 'Settings',
      divider: true,
      section: true,
      sticky: true,
      items: [
        { label: i18n('refresh', 'button'), onclick: onRefresh, keepOpenOnSelect: true, before: NeoIconRefresh },
        { label: i18n(`${context.theme}_mode`, 'button'), onclick: onTheme, keepOpenOnSelect: true, before: NeoIconTheme },
        { label: i18n('settings', 'button'), onclick: () => router.push({ name: RouteName.Settings }), before: NeoIconCog },
      ],
    },
    {
      value: 'Auth',
      divider: true,
      section: true,
      sticky: true,
      items: [
        { label: i18n('logout', 'button'), onclick: FeedlyService.logout, keepOpenOnSelect: true, before: NeoIconUnplug },
      ],
    },
  ];
</script>

<NeoButtonGroup rounded elevation={0} borderless>
  {#if AuthStore.profile}
    <NeoMenu keepOpenOnHover {items} placement="bottom-end" reverse disabled={!AuthStore.authenticated}>
      <NeoButton onclick={onClick} reverse {checked} style="min-width: max-content;">
        {AuthStore.profile.givenName}
        {#snippet icon()}
          <img src={AuthStore.profile.picture} alt="Github" width="24" height="24" style="border-radius: 50%" />
        {/snippet}
      </NeoButton>
    </NeoMenu>
  {/if}
</NeoButtonGroup>
