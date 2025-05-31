import type { FeedlyApiResponse, FeedlyClientAuthentication, FeedlyCollection, FeedlyCollectionRequest, FeedlyEntry, FeedlyProfile, FeedlyStream, FeedlyStreamRequest, FeedlyVisual } from '@dvcol/feedly-http-client/models';

import type { FeedEntry, FeedMedia, FeedUpdate } from '~/models/feed.model';

import { CacheRetention } from '@dvcol/common-utils/common/cache';
import { timeAgo } from '@dvcol/common-utils/common/date';
import { FeedlyClient } from '@dvcol/feedly-http-client';
import { feedly } from '@dvcol/feedly-http-client/api';
import { Config } from '@dvcol/feedly-http-client/config';
import { chromeRuntimeId } from '@dvcol/web-extension-utils/chrome/runtime';
import { createTab, tabs } from '@dvcol/web-extension-utils/chrome/tabs';
import { SvelteMap } from 'svelte/reactivity';

import { MessageType } from '~/models/message.model';
import { StorageKey } from '~/models/storage.model';
import { LoadingService } from '~/services/loading.service.svelte';
import { Logger } from '~/services/logger.service';
import { AuthStore } from '~/stores/authentication.store.svelte';
import { FeedStore } from '~/stores/feed.store.svelte';
import { sendMessage } from '~/utils/browser/browser-message.utils';
import { storage } from '~/utils/browser/browser-storage.utils';
import { HTTpChromeCacheStore } from '~/utils/cache.utils';

function alternateToUrl(alternate?: FeedlyEntry['alternate']): string | undefined {
  if (!alternate) return;
  return alternate?.find(i => i.href)?.href;
}

function visualToMedia(visual?: FeedlyVisual, alt?: string): FeedMedia | undefined {
  if (!visual) return undefined;
  const { url } = visual;
  if (!url) return undefined;
  return { type: 'image', image: { alt, src: url } };
}

function enclosureToMedia(enclosure?: FeedlyEntry['enclosure'], alt?: string): FeedMedia | undefined {
  if (!enclosure) return undefined;
  const { href } = enclosure?.find(i => i.href) ?? {};
  if (!href) return undefined;
  return { type: 'image', image: { alt, src: href } };
}

function getFavicon(url?: string): string | undefined {
  if (!url) return;
  try {
    return `https://www.google.com/s2/favicons?sz=16&domain=${new URL(url).hostname}`;
  } catch (e) {
    Logger.error('Failed to get favicon', e);
  }
}

const alphaNumericRegex = /[^a-z0-9\s]/i;
function getTags({
  origin,
  published,
  engagement,
}: Pick<FeedlyEntry, 'origin' | 'published' | 'engagement'>): FeedEntry['tags'] {
  const tags: FeedEntry['tags'] = [];
  if (origin?.title) tags.push({
    label: origin.title?.trim()?.split(alphaNumericRegex)?.at(0)?.trim(),
    color: 'var(--neo-color-secondary)',
    icon: getFavicon(origin?.htmlUrl),
  });
  if (engagement) {
    tags.push('/');
    let color: string | undefined;
    if (engagement > 100) color = 'var(--neo-color-error)';
    else if (engagement > 50) color = 'var(--neo-color-warning)';
    tags.push({ label: engagement.toString(), color });
  }
  if (published) tags.push('/', timeAgo(published));
  return tags;
}

function streamToFeed(stream: FeedlyStream): FeedUpdate {
  return {
    id: stream.id,
    entries: stream.items.map(
      ({ id, title, summary, canonicalUrl, visual, enclosure, alternate, origin, published, unread, engagement }, i) => ({
        id,
        label: title ?? id,
        description: summary?.content,
        media: visualToMedia(visual, `Visual for ${id ?? i}`) || enclosureToMedia(enclosure, `Visual for ${id ?? i}`),
        tags: getTags({ origin, published, engagement }),
        read: !unread,
        timestamp: published,
        href: canonicalUrl || alternateToUrl(alternate),
        onclick: async (e) => {
          const url = canonicalUrl || alternateToUrl(alternate);
          if (!url) return;
          e.preventDefault();
          return tabs?.update({ active: true, url });
        },
      } satisfies FeedEntry),
    ),
    next: !!stream.continuation,
  };
}

const streamPagination = new SvelteMap<FeedlyStream['id'], FeedlyStream['continuation']>();

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

  static async stream({ id, ...request }: FeedlyStreamRequest, { force = false, next = false }: { force?: boolean; next?: boolean } = {}): Promise<FeedlyStream> {
    FeedStore.load(id);
    const query = {
      id,
      count: FeedStore.pagination,
      ranked: 'newest',
      continuation: (next ? streamPagination.get(id) : undefined),
      ...request,
    } satisfies FeedlyStreamRequest;
    const response: FeedlyApiResponse<FeedlyStream> = await this.#client.streams.contents.cached(query, undefined, { force });
    const stream = await response.json();
    streamPagination.set(id, stream.continuation);
    FeedStore.update(streamToFeed(stream), next);
    FeedStore.loaded(id);
    return stream;
  }
}
