import { useState } from 'react';
import type { Artwork } from '@/types/artwork';
import { formatPrice } from '@/utils';
import { getAcquisitionState, getArtworkCurrency, getEffectivePrice, getOfferDetails } from '@/utils/commerce';
import { ConfidenceStrip } from '@/components/Commerce/ConfidenceStrip/ConfidenceStrip';
import { ArtworkCommercePanel } from '@/components/Commerce/ArtworkCommercePanel/ArtworkCommercePanel';
import livingRoomPlaceholder from '@/assets/living-room-placeholder.jpg';
import livingRoomP1 from '@/assets/livingroom-p1.png';
import livingRoomP2 from '@/assets/livingroom-p2.png';
import livingRoomP3 from '@/assets/livingroom-p3.png';
import livingRoomP4 from '@/assets/livingroom-p4.png';
import './DetailsSection.css';

interface DetailsSectionProps {
  artwork: Artwork;
  onStartPurchase: (artworkId: string) => void;
}

/** Room photo to composite the painting onto, keyed by palette id.
 * Palettes without an entry here fall back to the generic placeholder
 * room. */
const PALETTE_ROOM_IMAGES: Record<string, string> = {
  P1: livingRoomP1,
  P2: livingRoomP2,
  P3: livingRoomP3,
  P4: livingRoomP4,
};

/**
 * Page 3: an "in your house" mockup that composites the painting onto
 * a photographed living-room wall, followed by a standalone Collector's
 * Panel carrying the purchase decision (price, sale state, availability,
 * buy button) — kept off the photo itself so the room mockup stays
 * uncluttered and does all the "picture this on your wall" work alone.
 * Each room has its own hung-painting position/size per orientation
 * (see DetailsSection.css `data-room`) since the blank wall sits in a
 * different spot in every photo. The panel is omitted entirely (not
 * shown disabled) when `purchaseUrl` is absent, rather than pointing
 * somewhere generic.
 */
export function DetailsSection({ artwork, onStartPurchase }: DetailsSectionProps) {
  const roomKey = artwork.palette.id in PALETTE_ROOM_IMAGES ? artwork.palette.id.toLowerCase() : undefined;
  const price = getEffectivePrice(artwork);
  const offer = getOfferDetails(artwork);
  const acquisitionState = getAcquisitionState(artwork);
  const canPurchase = acquisitionState === 'available';
  const favoriteKey = `shir-gallery:favorites:${artwork.id}`;
  const [isFavorite, setIsFavorite] = useState(() => {
    try { return window.localStorage.getItem(favoriteKey) === 'true'; } catch { return false; }
  });

  const toggleFavorite = () => {
    setIsFavorite((current) => {
      const next = !current;
      try { window.localStorage.setItem(favoriteKey, String(next)); } catch { /* storage is optional */ }
      return next;
    });
  };

  return (
    <section className="details-section" aria-label={`${artwork.title}, in your home`}>
      <div className="in-your-house-frame" data-room={roomKey}>
        <img
          src={artwork.interiorImageUrl ?? PALETTE_ROOM_IMAGES[artwork.palette.id] ?? livingRoomPlaceholder}
          alt={`A curated living room composition featuring ${artwork.title}`}
          className="in-your-house-room"
        />
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}, composited onto the wall`}
          className="in-your-house-painting"
          data-orientation={artwork.orientation}
        />
        {price !== null && acquisitionState !== 'hidden' && (
          <div className="interior-price-plaque">
            <span>{offer ? offer.label : 'Original artwork'}</span>
            <strong>{formatPrice(price, getArtworkCurrency(artwork))}</strong>
            <small>{offer ? `Previously ${formatPrice(offer.originalPrice, getArtworkCurrency(artwork))}` : 'One of a kind'}</small>
          </div>
        )}
        <button
          type="button"
          className="interior-favorite-button"
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${artwork.title} from saved works` : `Save ${artwork.title}`}
          onClick={toggleFavorite}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 4.8a5.4 5.4 0 0 0-7.7 0L12 5.9l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.7Z" />
          </svg>
        </button>
        {canPurchase && (
          <button type="button" className="interior-purchase-button" onClick={() => onStartPurchase(artwork.id)}>
            <span aria-hidden="true">✦</span><span>Make this feeling yours.</span><span className="interior-purchase-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <ConfidenceStrip artwork={artwork} />
      <ArtworkCommercePanel artwork={artwork} onStartPurchase={onStartPurchase} />
    </section>
  );
}
