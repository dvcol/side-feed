// @ts-expect-error chrome issue
import type { chrome } from 'chrome';

import type { DefineComponent, WebComponents } from '~/web/define-component';

export const baseUrl = 'side-feed';

interface SideFeed {
  WebComponents: WebComponents;
  defineComponent: DefineComponent;
  default: DefineComponent;
}

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

export type { DefineComponent, SideFeed, WebComponents };
