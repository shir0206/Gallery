import type { Artwork, ArtworkCurrency } from '@/types/artwork';

export type AcquisitionState = 'hidden' | 'available' | 'reserved' | 'sold';

export function getEffectivePrice(artwork: Artwork): number | null {
  if (typeof artwork.price !== 'number' || artwork.price < 0) return null;
  return typeof artwork.salePrice === 'number' && artwork.salePrice >= 0 && artwork.salePrice < artwork.price
    ? artwork.salePrice
    : artwork.price;
}

export function getArtworkCurrency(artwork: Artwork): ArtworkCurrency {
  return artwork.commerce?.currency ?? 'USD';
}

export function getAcquisitionState(artwork: Artwork): AcquisitionState {
  if (getEffectivePrice(artwork) === null || !isSafePurchaseUrl(artwork.purchaseUrl)) return 'hidden';
  if (artwork.availability === 'sold') return 'sold';
  if (artwork.availability === 'reserved') return 'reserved';
  return 'available';
}

export function getOfferDetails(artwork: Artwork) {
  if (
    typeof artwork.price !== 'number' ||
    typeof artwork.salePrice !== 'number' ||
    artwork.salePrice < 0 ||
    artwork.salePrice >= artwork.price
  ) return null;
  return { originalPrice: artwork.price, price: artwork.salePrice, label: artwork.commerce?.offerLabel ?? 'Studio offer' };
}

export function isSafePurchaseUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
