import type { Artwork } from '@/types/artwork';
import { formatArtworkDimensions, formatPrice } from '@/utils';
import { getAcquisitionState, getArtworkCurrency, getEffectivePrice, getOfferDetails } from '@/utils/commerce';
import { ConfidenceStrip } from '@/components/Commerce/ConfidenceStrip/ConfidenceStrip';
import roomLandscape from '@/assets/room-landscape.webp';
import roomPortrait from '@/assets/room-portrait.webp';
import mobileRoomLandscape from '@/assets/mobile-room-landscape.webp';
import mobileRoomPortrait from '@/assets/mobile-room-portrait.webp';
import './DetailsSection.css';

interface DetailsSectionProps {
  artwork: Artwork;
  onAddToCart: (artworkId: string) => void;
}

export function DetailsSection({ artwork, onAddToCart }: DetailsSectionProps) {
  const price = getEffectivePrice(artwork);
  const offer = getOfferDetails(artwork);
  const state = getAcquisitionState(artwork);
  const currency = getArtworkCurrency(artwork);
  const canPurchase = state === 'available';
  const showCommerce = state !== 'hidden' && price !== null;
  const isPortrait = artwork.orientation === 'portrait';
  const dimensions = formatArtworkDimensions(
    artwork.dimensions.width,
    artwork.dimensions.height,
    artwork.dimensions.unit
  );

  return (
    <section className="details-section" aria-labelledby="acquisition-title" data-orientation={artwork.orientation}>
      <picture className="details-room" aria-hidden="true">
        <source media="(max-width: 639px)" srcSet={isPortrait ? mobileRoomPortrait : mobileRoomLandscape} />
        <img src={isPortrait ? roomPortrait : roomLandscape} alt="" />
        <img src={artwork.imageUrl} alt="" className="details-room-artwork" />
      </picture>
      <div className="acquisition-panel">
        <h2 id="acquisition-title">Bring that feeling at your home</h2>
        <span className="acquisition-rule" aria-hidden="true" />
        <p className="overview-description acquisition-artwork-title">{artwork.title}</p>
        <p className="overview-technical">
          Original {artwork.medium.toLowerCase()} · {dimensions}.
        </p>
        {showCommerce && (
          <div className="acquisition-offer">
            {offer && (
              <div className="acquisition-offer-top">
                <span className="acquisition-old-price">{formatPrice(offer.originalPrice, currency)}</span>
                <span className="acquisition-sale">Sale</span>
              </div>
            )}
            <strong>{formatPrice(price, currency)}</strong>
            {canPurchase ? (
              <button type="button" onClick={() => onAddToCart(artwork.id)}>
                <span>Add to collection</span><span aria-hidden="true">→</span>
              </button>
            ) : (
              <p className="acquisition-status">{state === 'sold' ? 'Private collection' : 'Reserved'}</p>
            )}
          </div>
        )}
        <ConfidenceStrip artwork={artwork} />
      </div>
      <p className="room-scale-note">Shown in a residential setting for scale and inspiration.</p>
    </section>
  );
}
