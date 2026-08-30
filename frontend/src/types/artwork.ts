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
  /** External link to buy this piece. Optional — when absent, the
   * "in your house" page's purchase CTA is omitted entirely rather
   * than pointing somewhere generic. */
  purchaseUrl?: string;
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
