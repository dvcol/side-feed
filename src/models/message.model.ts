import type { VersionUpdateDetails } from '@dvcol/web-extension-utils/chrome/models';

import type { IconActions } from '~/models/icon-action.model';

export const MessageType = {
  VersionUpdate: 'version-update',
  IconOptions: 'icon-options',
  ListenCode: 'listen-code',
  SendCode: 'send-code',
} as const;

export type MessageTypes = (typeof MessageType)[keyof typeof MessageType];

/**
 * Type union of possible message payloads
 */
export type MessagePayload<T extends MessageTypes = MessageTypes> =
  T extends typeof MessageType.VersionUpdate ? VersionUpdateDetails & { date: number } :
    T extends typeof MessageType.IconOptions ? { open: IconActions } :
      T extends typeof MessageType.ListenCode ? { state?: string } :
        T extends typeof MessageType.SendCode ? { code?: string; state?: string } :
          never;
