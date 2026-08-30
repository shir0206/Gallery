import type { ArtworkCollectionResponse } from '@/types/artwork';

const CACHE_KEY = 'gallery:artworkCollection';
const CACHE_TTL_MS = 48 * 60 * 60 * 1000;

interface CacheEntry {
  data: ArtworkCollectionResponse;
  savedAt: number;
}

/**
 * Reads the cached artwork collection from localStorage, discarding
 * (and clearing) it once it's older than CACHE_TTL_MS so a stale
 * cache never outlives its 48-hour window.
 */
export function readArtworkCollectionCache(): ArtworkCollectionResponse | null {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  let entry: CacheEntry;
  try {
    entry = JSON.parse(raw);
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  if (Date.now() - entry.savedAt > CACHE_TTL_MS) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return entry.data;
}

export function writeArtworkCollectionCache(data: ArtworkCollectionResponse): void {
  const entry: CacheEntry = { data, savedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function clearArtworkCollectionCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
