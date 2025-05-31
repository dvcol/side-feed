import type { Feed, FeedUpdate } from '~/models/feed.model';

import { debounce } from '@dvcol/common-utils/common/debounce';
import { SvelteMap } from 'svelte/reactivity';

import { StorageKey } from '~/models/storage.model';
import { Logger } from '~/services/logger.service';
import { storage } from '~/utils/browser/browser-storage.utils';

let pagination = $state(25);

const feeds = new SvelteMap<Feed['id'], Feed>();
const streams = new SvelteMap<Feed['id'], Feed>();
const loading = new SvelteMap<Feed['id'], boolean>();

let active = $state<Feed['id']>();

const saveActive = debounce(async (id: Feed['id']) => storage.local.set(StorageKey.FeedActive, id));

export class FeedStore {
  static get pagination() {
    return pagination;
  }

  static set pagination(value: number) {
    pagination = value;
  }

  static async init() {
    active = await storage.local.get<Feed['id']>(StorageKey.FeedActive);
    if (active && !feeds.has(active)) return storage.local.remove(StorageKey.FeedActive);
    console.info('FeedStore.init', { active, feeds });
  }

  static get feeds() {
    return feeds.values();
  }

  static get active() {
    return active;
  }

  static set active(id: Feed['id'] | undefined) {
    active = id;
    try {
      void saveActive(id);
    } catch (e) {
      Logger.error('Fail to persist active feed', e);
    }
  }

  static add(..._feeds: Feed[]) {
    _feeds.forEach(_feed => feeds.set(_feed.id, { ...feeds.get(_feed.id), ..._feed }));
  }

  static remove(_feeds: Feed['id'][]) {
    _feeds.forEach(_feed => feeds.delete(_feed));
  }

  static get(id: Feed['id']): Feed | undefined {
    return streams.get(id) ?? feeds.get(id);
  }

  static update(_feed: FeedUpdate, append = false) {
    const _new = { ...feeds.get(_feed.id), ..._feed };
    if (append && _new.entries) _new.entries = streams.get(_feed.id)?.entries?.concat(_new.entries) ?? _new.entries;
    if (!_new.id) throw new Error('Missing required id property');
    if (!_new.label) throw new Error('Missing required label property');
    streams.set(_feed.id, _new as Feed);
  }

  static load(id: Feed['id']) {
    loading.set(id, true);
  }

  static loaded(id: Feed['id']) {
    loading.delete(id);
  }

  static loading(id: Feed['id']) {
    return !!loading.get(id);
  }
}
