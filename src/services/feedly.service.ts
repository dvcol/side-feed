import type { FeedlyApiResponse, FeedlyClientAuthentication, FeedlyCollection, FeedlyCollectionRequest, FeedlyProfile, FeedlyStream, FeedlyStreamRequest } from '@dvcol/feedly-http-client/models';

import type { FeedEntry } from '~/models/feed.model';

import { CacheRetention } from '@dvcol/common-utils/common/cache';
import { FeedlyClient } from '@dvcol/feedly-http-client';
import { feedly } from '@dvcol/feedly-http-client/api';
import { Config } from '@dvcol/feedly-http-client/config';
import { chromeRuntimeId } from '@dvcol/web-extension-utils/chrome/runtime';
import { createTab, tabs } from '@dvcol/web-extension-utils/chrome/tabs';

import { MessageType } from '~/models/message.model';
import { StorageKey } from '~/models/storage.model';
import { LoadingService } from '~/services/loading.service';
import { Logger } from '~/services/logger.service';
import { AuthStore } from '~/stores/authentication.store.svelte';
import { FeedStore } from '~/stores/feed.store.svelte';
import { sendMessage } from '~/utils/browser/browser-message.utils';
import { storage } from '~/utils/browser/browser-storage.utils';
import { HTTpChromeCacheStore } from '~/utils/cache.utils';

export class FeedlyService {
  static #cache = new HTTpChromeCacheStore<FeedlyApiResponse>({ prefix: 'feedly', retention: CacheRetention.Day });
  static #client: FeedlyClient = new FeedlyClient({

    client_id: import.meta.env.VITE_FEEDLY_CLIENT_ID,
    client_secret: import.meta.env.VITE_FEEDLY_CLIENT_SECRET,
    redirect_uri: import.meta.env.VITE_FEEDLY_REDIRECT_URI,

    useragent: `${import.meta.env.PKG_NAME}/${import.meta.env.PKG_VERSION}`,

    endpoint: Config.Endpoint,
    cacheStore: this.#cache,
  }, {}, feedly);

  static get client(): FeedlyClient {
    return this.#client;
  }

  /** Initialize the service */

  static async restore(): Promise<void> {
    const auth = await storage.sync.get<FeedlyClientAuthentication>(StorageKey.FeedlyAuth);
    if (auth) await this.#client.restore(auth);
  }

  static async init(): Promise<void> {
    this.#client.onAuthChange(async (_auth) => {
      Logger.debug('TraktClient.onAuthChange', { ..._auth });

      // Update auth state
      AuthStore.authenticated = _auth?.access_token !== undefined;
      AuthStore.profile = AuthStore.authenticated ? await this.profile() : undefined;
      if (!AuthStore.authenticated) return;
      await FeedlyService.collections();
    });

    this.#client.onCall(async (call) => {
      Logger.debug('TraktClient.onCall', call);
      await LoadingService.listen(call.query);
    });

    await this.restore();
  }

  /** Authentication methods */

  static async redirect(): Promise<void> {
    const url = this.#client.redirectUrl();
    await sendMessage({ type: MessageType.ListenCode, payload: { state: this.#client.auth.state } });
    // open in new tab if not in panel
    if (tabs?.update && chromeRuntimeId) await tabs?.update({ url });
    else await createTab({ url, active: true });
  }

  static async login(code: string): Promise<void> {
    const auth = await this.#client.token({ code });
    await storage.sync.set(StorageKey.FeedlyAuth, auth);
  }

  static async refresh(): Promise<void> {
    const auth = await this.#client.refresh();
    await storage.sync.set(StorageKey.FeedlyAuth, auth);
  }

  static async logout(): Promise<void> {
    await this.#client.revoke();
    await storage.sync.remove(StorageKey.FeedlyAuth);
  }

  /** Feedly methods */

  static async profile(): Promise<FeedlyProfile> {
    const response: FeedlyApiResponse<FeedlyProfile> = await this.#client.profile.get.cached(undefined, undefined, { retention: CacheRetention.Week });
    return response.json();
  }

  static async collections(request?: FeedlyCollectionRequest): Promise<FeedlyCollection[]> {
    const response: FeedlyApiResponse<FeedlyCollection[]> = await this.#client.collections.get.cached(request);
    const collections = await response.json();
    FeedStore.add(...collections);
    return collections;
  }

  static async stream({ id, ...request }: FeedlyStreamRequest, force = false): Promise<FeedlyStream> {
    FeedStore.load(id);
    const response: FeedlyApiResponse<FeedlyStream> = await this.#client.streams.contents.cached({ id, count: 100, ...request }, undefined, { force });
    const stream = await response.json();
    FeedStore.update({ id: stream.id, entries: stream.items.map(({ id, title, summary, canonicalUrl }) => ({ id, label: title ?? id, description: summary?.content, href: canonicalUrl } satisfies FeedEntry)) });
    FeedStore.loaded(id);
    return stream;
  }
}
