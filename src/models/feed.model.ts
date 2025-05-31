export interface FeedMedia {
  caption?: string;
  type?: 'image' | 'video' | 'audio';
  image?: {
    alt?: string;
    src: string;
  };
}

export interface FeedEntry {
  id: string;
  label: string;
  description?: string;
  timestamp?: number;
  read?: boolean;
  media?: FeedMedia;
  href?: string;
  tags?: (string | { label?: string; href?: string; color?: string; icon?: string })[];
  onclick?: (e: PointerEvent) => unknown;
}

export interface Feed {
  id: string;
  label: string;
  description?: string;
  entries?: FeedEntry[];
  next?: boolean;
}

export interface FeedUpdate extends Partial<Feed> {
  id: Feed['id'];
}
