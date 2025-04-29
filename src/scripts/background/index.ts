import { onVersionUpdate } from '@dvcol/web-extension-utils/chrome/runtime';
import { setPanelBehavior } from '@dvcol/web-extension-utils/chrome/side-panel';

import { MessageType } from '~/models/message.model';
import { Logger } from '~/services/logger.service';
import { storage } from '~/utils/browser/browser-storage.utils';

Logger.debug('Background script started');

try {
  onVersionUpdate(async (details) => {
    const { previousVersion, nextVersion } = details;
    if (previousVersion?.split('.').slice(0, 2).join('.') === nextVersion?.split('.').slice(0, 2).join('.')) return;
    Logger.info('Extension updated', details);
    await storage.local.set(MessageType.VersionUpdate, { ...details, date: Date.now() });
  });
} catch (error) {
  Logger.error('Failed to handle version update', error);
}

void setPanelBehavior?.({ openPanelOnActionClick: true })
  .catch((error) => {
    Logger.error('Failed to set panel behavior', error);
  });
