/**
 * General-purpose utilities. Empty-ish for Phase 1 —
 * placeholder so the folder (and import path) exists for later phases
 * (e.g. scroll-position helpers, index clamping, debouncing).
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Combines an artwork's separate day/month/year fields into a single
 * display string, e.g. (22, 1, 2011) -> "22 January 2011".
 */
export function formatArtworkDate(day: number, month: number, year: number): string {
  const monthName = MONTH_NAMES[month - 1] ?? '';
  return `${day} ${monthName} ${year}`.trim();
}

/**
 * Formats artwork dimensions as e.g. "21 × 29.7 cm". Trims trailing
 * zeroes on each measurement so whole numbers don't render as "21.0".
 */
export function formatArtworkDimensions(
  width: number,
  height: number,
  unit: string,
): string {
  return `${width} × ${height} ${unit}`;
}

/**
 * Given a list of items with an `id` and the currently-selected id,
 * returns the id one step in the given direction, wrapping around at
 * either end so the collection reads as a loop rather than a
 * dead-ended list. Mirrors the wrap-around logic Gallery.tsx uses for
 * its own previous/next controls — shared here so GalleryPage can
 * step through the same collection independently for the editorial
 * ArtworkPage view without duplicating the wraparound math.
 */
export function getAdjacentId(
  items: Array<{ id: string }>,
  currentId: string | null,
  direction: 'previous' | 'next',
): string | null {
  if (items.length === 0) return null;
  const currentIndex = items.findIndex((item) => item.id === currentId);

  if (direction === 'previous') {
    const previousIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    return items[previousIndex].id;
  }

  const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
  return items[nextIndex].id;
}
