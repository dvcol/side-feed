import { mount } from 'svelte';

import App from '~/components/App.svelte';

export interface CreateOptions {
  baseUrl?: string;
  view?: { option?: boolean; popup?: boolean; web?: boolean };
  shadow?: ShadowRootInit;
}
export function createWc({ shadow, ...options }: CreateOptions) {
  class AppWc extends HTMLElement {
    async connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: 'closed', ...shadow });

      return mount(App, { target: shadowRoot, props: options });
    }
  }
  return AppWc;
}
