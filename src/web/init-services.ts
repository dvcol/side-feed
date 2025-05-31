import type { MessagePayload } from '~/models/message.model';

import { LoggerColor } from '@dvcol/common-utils/common/logger';

import { MessageType } from '~/models/message.model';
import { FeedlyService } from '~/services/feedly.service';
import { Logger } from '~/services/logger.service';
import { AuthStore } from '~/stores/authentication.store.svelte';
import { FeedStore } from '~/stores/feed.store.svelte';
import { storage } from '~/utils/browser/browser-storage.utils';
import { waitI18nReady } from '~/utils/i18n.utils';

async function onVersionUpdate(storageKey = MessageType.VersionUpdate) {
  const versionUpdate = await storage.local.get<MessagePayload<typeof storageKey> | undefined>(storageKey);
  if (!versionUpdate) return;

  Logger.debug('Version updated', versionUpdate);

  await storage.local.remove(storageKey);
}

export async function initServices(options: { option?: boolean; popup?: boolean; panel?: boolean; web?: boolean } = {}) {
  await waitI18nReady();

  // Initialize Feedly service
  await FeedlyService.init();

  // Initialize Feed store
  await FeedStore.init();

  // Restore active feed
  if (FeedStore.active) await FeedlyService.stream({ id: FeedStore.active }, { force: true });

  if (window) (window as any).FeedlyService = FeedlyService;
  if (window) (window as any).AuthStore = AuthStore;

  Logger.info(...Logger.colorize(LoggerColor.Success, 'All services initialized!'), options);

  onVersionUpdate().catch(Logger.error);
}
