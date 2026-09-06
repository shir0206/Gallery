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

export type ArtworkCurrency = 'USD' | 'EUR' | 'GBP';

export interface ArtworkCommerce {
  currency?: ArtworkCurrency;
  offerLabel?: string;
  signed?: boolean;
  certificateIncluded?: boolean;
  reservationDays?: number;
  shipping?: {
    worldwide: boolean;
    insured: boolean;
    estimatedBusinessDays?: { min: number; max: number };
  };
}

export interface ArtworkDetailImage {
  id: string;
  imageUrl: string;
  alt: string;
  objectPosition?: string;
}

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
  /** External link to buy this piece. */
  purchaseUrl: string;
  /** List price in the currency specified by `commerce`. */
  price: number;
  /** Present + lower than `price` means the piece is on sale; the wall
   * CTA then shows `price` struck through next to this value instead. */
  salePrice: number;
  /** Commercial availability. Distinct from `status` above, which is a
   * publishing/content status, not commerce. `'available'` renders no
   * badge (silence is the default-good signal); `'reserved'`/`'sold'`
   * render a badge, and `'sold'` also disables the purchase button. */
  availability: 'available' | 'reserved' | 'sold';
  commerce: ArtworkCommerce;
  detailImages: ArtworkDetailImage[];
  interiorImageUrl: string;
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
