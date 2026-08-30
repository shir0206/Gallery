/**
 * Core domain types for the gallery, matching the shape returned by
 * the real artwork API (Phase 2).
 */

export interface ArtworkDimensions {
  width: number;
  height: number;
  unit: string;
}

export interface ArtworkDescription {
  materials: string;
  visual: string;
  inspiration: string;
}

export interface ArtworkPalette {
  id: string;
  name: string;
}

export type ArtworkOrientation = 'portrait' | 'landscape';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  month: number;
  day: number;
  medium: string;
  dimensions: ArtworkDimensions;
  category: string[];
  status: string;
  description: ArtworkDescription;
  imageUrl: string;
  orientation: ArtworkOrientation;
  palette: ArtworkPalette;
  /** External link to buy this piece. Optional — when absent, every
   * purchase CTA (wall overlay, "in your house" page) is omitted
   * entirely rather than pointing somewhere generic. */
  purchaseUrl?: string;
  /** List price in USD. Optional, same omit-rather-than-fallback rule
   * as `purchaseUrl` — pieces without one show no price/CTA at all. */
  price?: number;
  /** Present + lower than `price` means the piece is on sale; the wall
   * CTA then shows `price` struck through next to this value instead. */
  salePrice?: number;
  /** Commercial availability. Optional, same omit-rather-than-fallback
   * rule as `price`/`purchaseUrl`: absent means the availability badge
   * isn't shown at all. Distinct from `status` above, which is a
   * publishing/content status, not commerce. `'available'` renders no
   * badge (silence is the default-good signal); `'reserved'`/`'sold'`
   * render a badge, and `'sold'` also disables the purchase button. */
  availability?: 'available' | 'reserved' | 'sold';
}

/** Shape returned by the artwork API/data layer. */
export interface ArtworkApiResponse {
  data: Artwork[];
}

/**
 * Environment/background config for the gallery room itself.
 * Not part of the artwork API — kept separate since it describes the
 * viewing space, not a piece of art.
 */
export interface GalleryEnvironment {
  backgroundImageUrl: string;
  name?: string;
}

/** Combined shape the UI consumes: the room plus its artworks. */
export interface ArtworkCollectionResponse {
  environment: GalleryEnvironment;
  artworks: Artwork[];
}
