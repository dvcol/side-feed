<script lang="ts">
  import { NeoButton } from '@dvcol/neo-svelte';
  import { useRouter } from '@dvcol/svelte-simple-router';

  import { MessageType } from '~/models/message.model';
  import { RouteName } from '~/router/routes';
  import { FeedlyService } from '~/services/feedly.service';
  import { Logger } from '~/services/logger.service';
  import { AuthStore } from '~/stores/authentication.store.svelte';
  import { onMessage } from '~/utils/browser/browser-message.utils';
  import { useI18n } from '~/utils/i18n.utils';

  const i18n = useI18n('login');

  const onLogin = async () => {
    return FeedlyService.redirect();
  };

  const router = useRouter();

  try {
    onMessage(MessageType.SendCode, async () => {
      await FeedlyService.restore();
      if (!AuthStore.authenticated) return;
      await router.push({ name: RouteName.Feed });
    });
  } catch (error) {
    Logger.error('Failed to handle context menu message', error);
  }

</script>

<NeoButton glass rounded onclick={onLogin}>{i18n('button')}</NeoButton>
