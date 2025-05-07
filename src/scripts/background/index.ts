import { onVersionUpdate } from '@dvcol/web-extension-utils/chrome/runtime';
import { getPanelBehavior, setPanelBehavior } from '@dvcol/web-extension-utils/chrome/side-panel';
import { tabs } from '@dvcol/web-extension-utils/chrome/tabs';

import { IconAction } from '~/models/icon-action.model';
import { MessageType } from '~/models/message.model';
import { FeedlyService } from '~/services/feedly.service';
import { Logger } from '~/services/logger.service';
import { onMessage, sendMessage } from '~/utils/browser/browser-message.utils';
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

try {
  onMessage(MessageType.IconOptions, async (message) => {
    if (!message.payload) return;
    if (!setPanelBehavior || !getPanelBehavior) return;
    const options = await getPanelBehavior();
    const openPanel = message.payload.open === IconAction.Panel;
    if (options.openPanelOnActionClick === openPanel) return;
    void setPanelBehavior({ openPanelOnActionClick: openPanel });
  });
} catch (error) {
  Logger.error('Failed to handle side panel options message', error);
}

let state: string | undefined;
let timeout: ReturnType<typeof setTimeout>;
function removeListener() {
  if (timeout) clearTimeout(timeout);
  tabs?.onUpdated.removeListener(listenToTabs);
  state = undefined;
}

async function listenToTabs(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
  if (!state) return;
  if (!changeInfo.url) return;
  const url = new URL(changeInfo.url);
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.get('state') !== state) return;
  Logger.debug('Code received, attempting to login...', { code, state });
  await FeedlyService.login(code);
  await sendMessage({ type: MessageType.SendCode, payload: { code, state } });
  removeListener();
}

try {
  onMessage(MessageType.ListenCode, async (message) => {
    state = message.payload?.state;
    tabs?.onUpdated.addListener(listenToTabs);

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(removeListener, 1000 * 60 * 5); // remove listener after 5 minutes
  });
} catch (error) {
  Logger.error('Failed to handle context menu message', error);
  removeListener();
}
