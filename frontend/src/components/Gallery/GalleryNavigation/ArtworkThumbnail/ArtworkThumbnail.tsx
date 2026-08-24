import { forwardRef } from 'react';
import type { Artwork } from '@/types/artwork';
import './ArtworkThumbnail.css';

interface ArtworkThumbnailProps {
  artwork: Artwork;
  isActive: boolean;
  onSelect: (artworkId: string) => void;
}

/**
 * A single clickable thumbnail in the bottom navigation strip.
 * Forwards its ref so GalleryNavigation can scroll the active
 * thumbnail into view when selection changes from elsewhere (e.g. the
 * previous/next controls) without the strip itself driving selection.
 */
export const ArtworkThumbnail = forwardRef<HTMLButtonElement, ArtworkThumbnailProps>(
  function ArtworkThumbnail({ artwork, isActive, onSelect }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`artwork-thumbnail ${isActive ? 'artwork-thumbnail-active' : ''}`}
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
