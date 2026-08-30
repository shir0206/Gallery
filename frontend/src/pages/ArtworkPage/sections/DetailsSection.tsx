import type { Artwork } from '@/types/artwork';
import { formatPrice } from '@/utils';
import livingRoomPlaceholder from '@/assets/living-room-placeholder.jpg';
import livingRoomP1 from '@/assets/livingroom-p1.png';
import livingRoomP2 from '@/assets/livingroom-p2.png';
import livingRoomP3 from '@/assets/livingroom-p3.png';
import livingRoomP4 from '@/assets/livingroom-p4.png';
import './DetailsSection.css';

interface DetailsSectionProps {
  artwork: Artwork;
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

const AVAILABILITY_LABEL: Record<'reserved' | 'sold', string> = {
  reserved: 'Reserved',
  sold: 'Sold',
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
export function DetailsSection({ artwork }: DetailsSectionProps) {
  const roomKey = artwork.palette.id in PALETTE_ROOM_IMAGES ? artwork.palette.id.toLowerCase() : undefined;
  const { price, salePrice, purchaseUrl, availability } = artwork;
  const onSale = typeof price === 'number' && typeof salePrice === 'number' && salePrice < price;
  const isSold = availability === 'sold';
  const showAvailabilityBadge = availability === 'reserved' || availability === 'sold';

  return (
    <section className="details-section" aria-label={`${artwork.title}, in your home`}>
      <div className="in-your-house-frame" data-room={roomKey}>
        <img
          src={PALETTE_ROOM_IMAGES[artwork.palette.id] ?? livingRoomPlaceholder}
          alt="A living room wall"
          className="in-your-house-room"
        />
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}, composited onto the wall`}
          className="in-your-house-painting"
          data-orientation={artwork.orientation}
        />
      </div>
      {purchaseUrl && (
        <div className="collector-panel">
          <div className="collector-panel-info">
            <p className="collector-panel-recap">
              {artwork.title} — {artwork.artist}
            </p>
            {typeof price === 'number' && (
              <div className="collector-panel-price">
                {onSale && <span className="collector-panel-sale-badge">Sale</span>}
                {onSale && (
                  <span className="collector-panel-price-original">{formatPrice(price)}</span>
                )}
                <span className={onSale ? 'collector-panel-price-sale' : 'collector-panel-price-plain'}>
                  {formatPrice(onSale ? salePrice! : price)}
                </span>
              </div>
            )}
          </div>
          <div className="collector-panel-action">
            {showAvailabilityBadge && (
              <span className="collector-panel-availability-badge" data-availability={availability}>
                {AVAILABILITY_LABEL[availability as 'reserved' | 'sold']}
              </span>
            )}
            {isSold ? (
              <button type="button" className="collector-panel-purchase" disabled>
                Sold
              </button>
            ) : (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="collector-panel-purchase"
                aria-label={`Purchase ${artwork.title} now`}
              >
                Purchase Now
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
