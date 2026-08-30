import type { Artwork } from '@/types/artwork';
import { formatPrice } from '@/utils';
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
  const { price, salePrice, purchaseUrl } = artwork;
  if (!price || !purchaseUrl) return null;

  const onSale = typeof salePrice === 'number' && salePrice < price;

  return (
    <div className="artwork-purchase-cta">
      {onSale && <span className="artwork-purchase-sale-badge">Sale</span>}
      <span className="artwork-purchase-price">
        {onSale && <span className="artwork-purchase-price-original">{formatPrice(price)}</span>}
        <span className={onSale ? 'artwork-purchase-price-sale' : undefined}>
          {formatPrice(onSale ? salePrice! : price)}
        </span>
      </span>
      <a
        href={purchaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="artwork-purchase-button"
        onClick={(event) => event.stopPropagation()}
        aria-label={`Purchase ${artwork.title} now`}
      >
        Purchase Now
      </a>
    </div>
  );
}
