export interface FeedEntry {
  id: string;
  label: string;
  description?: string;
  href?: string;
}

export interface Feed {
  id: string;
  label: string;
  description?: string;
  entries?: FeedEntry[];
}
