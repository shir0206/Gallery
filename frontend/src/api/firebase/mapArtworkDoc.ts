import type {
  Artwork,
  ArtworkDescription,
  ArtworkDimensions,
  ArtworkOrientation,
  ArtworkPalette,
} from '@/types/artwork';

type RawDoc = Record<string, unknown>;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isPlainObject(value: unknown): value is RawDoc {
  return typeof value === 'object' && value !== null;
}

function requireString(data: RawDoc, field: string): string {
  const value = data[field];
  if (!isString(value) || value.trim() === '') {
    throw new Error(`missing or invalid required field "${field}"`);
  }
  return value;
}

function requireNumber(data: RawDoc, field: string): number {
  const value = data[field];
  if (!isNumber(value)) {
    throw new Error(`missing or invalid required field "${field}"`);
  }
  return value;
}

function parseDimensions(data: RawDoc): ArtworkDimensions {
  const raw = data.dimensions;
  if (!isPlainObject(raw) || !isNumber(raw.width) || !isNumber(raw.height) || !isString(raw.unit)) {
    throw new Error('missing or invalid "dimensions" (expected { width, height, unit })');
  }
  return { width: raw.width, height: raw.height, unit: raw.unit };
}

function parseDescription(data: RawDoc): ArtworkDescription {
  const raw = data.description;
  if (
    !isPlainObject(raw) ||
    !isString(raw.materials) ||
    !isString(raw.visual) ||
    !isString(raw.inspiration)
  ) {
    throw new Error(
      'missing or invalid "description" (expected { materials, visual, inspiration })',
    );
  }
  return { materials: raw.materials, visual: raw.visual, inspiration: raw.inspiration };
}

function parsePalette(data: RawDoc): ArtworkPalette {
  const raw = data.palette;
  if (!isPlainObject(raw) || !isString(raw.id) || !isString(raw.name)) {
    throw new Error('missing or invalid "palette" (expected { id, name })');
  }
  return { id: raw.id, name: raw.name };
}

function parseOrientation(data: RawDoc): ArtworkOrientation {
  const value = data.orientation;
  if (value !== 'portrait' && value !== 'landscape') {
    throw new Error('missing or invalid "orientation" (expected "portrait" or "landscape")');
  }
  return value;
}

/**
 * Maps a raw Firestore document into the app's Artwork domain type.
 *
 * Throws on missing/malformed required fields rather than silently
 * defaulting them, so a corrupted document is surfaced (and skipped by
 * the caller) instead of rendering broken UI.
 */
export function mapDocToArtwork(id: string, rawData: unknown): Artwork {
  if (!isPlainObject(rawData)) {
    throw new Error('document data is not an object');
  }

  return {
    id,
    title: requireString(rawData, 'title'),
    artist: requireString(rawData, 'artist'),
    year: requireNumber(rawData, 'year'),
    month: requireNumber(rawData, 'month'),
    day: requireNumber(rawData, 'day'),
    medium: requireString(rawData, 'medium'),
    dimensions: parseDimensions(rawData),
    category: isStringArray(rawData.category) ? rawData.category : [],
    status: requireString(rawData, 'status'),
    description: parseDescription(rawData),
    imageUrl: requireString(rawData, 'imageUrl'),
    orientation: parseOrientation(rawData),
    palette: parsePalette(rawData),
  };
}
