import type { Artwork } from '@/types/artwork';
import livingRoomPlaceholder from '@/assets/living-room-placeholder.jpg';
import livingRoomP1 from '@/assets/livingroom-p1.png';
import './DetailsSection.css';

interface DetailsSectionProps {
  artwork: Artwork;
}

/** Room photo to composite the painting onto, keyed by palette id.
 * Palettes without an entry here fall back to the generic placeholder
 * room. */
const PALETTE_ROOM_IMAGES: Record<string, string> = {
  P1: livingRoomP1,
};

/**
 * Page 3: an "in your house" mockup that composites the painting onto
 * a photographed living-room wall, with a purchase link overlaid on
 * it when the artwork has one. The room photo is picked by the
 * artwork's palette (see `PALETTE_ROOM_IMAGES`), falling back to a
 * generic placeholder room for palettes without one. The purchase
 * link is omitted entirely (not shown disabled) when `purchaseUrl` is
 * absent, rather than pointing somewhere generic.
 */
export function DetailsSection({ artwork }: DetailsSectionProps) {
  const isP1Room = artwork.palette.id in PALETTE_ROOM_IMAGES;

  return (
    <section className="details-section" aria-label={`${artwork.title}, in your home`}>
      <div className="in-your-house-frame" data-room={isP1Room ? 'p1' : undefined}>
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
        {artwork.purchaseUrl && (
          <a
            href={artwork.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="in-your-house-purchase"
          >
            Purchase this piece →
          </a>
        )}
      </div>
    </section>
  );
}
