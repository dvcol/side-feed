import type { NeoProgressHTMLElement } from '@dvcol/neo-svelte';

import { NeoProgressService } from '@dvcol/neo-svelte';

import { Logger } from '~/services/logger.service';

export class LoadingService {
  static #progress?: NeoProgressService;

  static init(ref: NeoProgressHTMLElement) {
    this.#progress = new NeoProgressService(ref);
  }

  static destroy() {
    this.#progress = undefined;
  }

  static async listen<T extends Promise<unknown>>(promise: T) {
    if (!this.#progress) return Logger.warn('LoadingService not initialized');
    const id = this.#progress.start({ indeterminate: true });
    // TODO - start indeterminate progress
    // TODO - internal start counter
    // TODO - complete state - success, error, warning, empty
    try {
      await promise;
      this.#progress.cancel(id);
    } catch (error) {
      // change color
      this.#progress.error();
      Logger.debug('LoadingService error', error);
    }
  }
}
