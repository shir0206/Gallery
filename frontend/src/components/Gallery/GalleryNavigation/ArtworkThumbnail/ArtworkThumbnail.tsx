import { forwardRef } from 'react';
import type { Artwork } from '@/types/artwork';
import './ArtworkThumbnail.css';

interface ArtworkThumbnailProps {
  artwork: Artwork;
  isActive: boolean;
  /** Whether this artwork is currently hanging on the wall above (per
   * ArtworkViewer's own IntersectionObserver) — unrelated to whether
   * the thumbnail itself happens to be scrolled into view within the
   * strip. Drives opacity independently of `isActive`: several
   * thumbnails can be "shown" at once, only one is ever "active". */
  isVisible: boolean;
  onSelect: (artworkId: string) => void;
}

/**
 * A single clickable thumbnail in the bottom navigation strip.
 * Forwards its ref so GalleryNavigation can scroll the active
 * thumbnail into view when selection changes from elsewhere (e.g. the
 * previous/next controls).
 */
export const ArtworkThumbnail = forwardRef<HTMLButtonElement, ArtworkThumbnailProps>(
  function ArtworkThumbnail({ artwork, isActive, isVisible, onSelect }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        data-artwork-id={artwork.id}
        className={`artwork-thumbnail ${isActive ? 'artwork-thumbnail-active' : ''} ${
          isVisible ? 'artwork-thumbnail-visible' : 'artwork-thumbnail-overflow'
        }`}
        onClick={() => onSelect(artwork.id)}
        // This is a "which one of the set is currently showing" state,
        // not a toggle — aria-current models that more accurately than
        // aria-pressed and is what most screen readers announce as
        // "current" rather than "pressed".
        aria-current={isActive ? 'true' : undefined}
        aria-label={`View ${artwork.title} by ${artwork.artist}`}
      >
        {/* Decorative: the button's aria-label already gives the
            accessible name, so the image doesn't need its own alt
            text (avoids the title being announced twice). */}
        <img src={artwork.imageUrl} alt="" className="artwork-thumbnail-image" />
      </button>
    );
  },
);
