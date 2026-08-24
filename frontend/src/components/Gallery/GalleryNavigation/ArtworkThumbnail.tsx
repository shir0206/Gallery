import { forwardRef } from 'react';
import type { Artwork } from '@/types/artwork';
import styles from './ArtworkThumbnail.module.css';

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
        className={`${styles.thumbnail} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(artwork.id)}
        aria-pressed={isActive}
        aria-label={`View ${artwork.title} by ${artwork.artist}`}
      >
        <img src={artwork.imageUrl} alt={artwork.title} className={styles.image} />
      </button>
    );
  },
);
