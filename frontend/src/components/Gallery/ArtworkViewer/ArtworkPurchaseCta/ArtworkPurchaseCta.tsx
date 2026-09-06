import type { Artwork } from '@/types/artwork';
import { formatPrice } from '@/utils';
import { getAcquisitionState, getArtworkCurrency, getEffectivePrice, getOfferDetails } from '@/utils/commerce';
import './ArtworkPurchaseCta.css';

interface ArtworkPurchaseCtaProps {
  artwork: Artwork;
}

/**
 * Overlay on a single wall frame: price (struck-through original +
 * sale price when `salePrice` is set) plus a "Purchase Now" button.
 * Renders nothing when the artwork has no `price` or `purchaseUrl` —
 * same omit-rather-than-fallback rule the "in your house" page CTA
 * already follows, so pieces not for sale show no partial affordance.
 */
export function ArtworkPurchaseCta({ artwork }: ArtworkPurchaseCtaProps) {
  const state = getAcquisitionState(artwork);
  const price = getEffectivePrice(artwork);
  const offer = getOfferDetails(artwork);
  if (state === 'hidden' || price === null) return null;

  return (
    <div className="artwork-purchase-cta">
      {offer && <span className="artwork-purchase-sale-badge">{offer.label}</span>}
      <span className="artwork-purchase-price">
        {offer && <span className="artwork-purchase-price-original">{formatPrice(offer.originalPrice, getArtworkCurrency(artwork))}</span>}
        <span className={offer ? 'artwork-purchase-price-sale' : undefined}>
          {formatPrice(price, getArtworkCurrency(artwork))}
        </span>
      </span>
      {state === 'available' ? <a
        href={artwork.purchaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="artwork-purchase-button"
        onClick={(event) => event.stopPropagation()}
        aria-label={`Purchase ${artwork.title} now`}
      >Purchase this piece</a> : <span className="artwork-purchase-unavailable">{state === 'sold' ? 'Private collection' : 'Reserved'}</span>}
    </div>
  );
}
