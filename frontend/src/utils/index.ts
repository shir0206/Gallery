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
