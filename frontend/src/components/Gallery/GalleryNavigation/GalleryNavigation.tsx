import { useEffect, useRef } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkThumbnail } from './ArtworkThumbnail';
import { useHorizontalScroll } from './useHorizontalScroll';
import styles from './GalleryNavigation.module.css';

interface GalleryNavigationProps {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (artworkId: string) => void;
}

/**
 * Horizontal filmstrip / mini-map of the entire collection.
 *
 * Native touch panning and trackpad scrolling (and Shift+wheel on a
 * mouse) already scroll a horizontally-overflowing flex row for free.
 * `useHorizontalScroll` adds the two cases that don't work out of the
 * box: converting a plain mouse wheel's vertical delta into horizontal
 * movement, and click-and-drag panning for mouse users.
 *
 * The strip only ever *reads* `selectedArtworkId` (to highlight the
 * active thumbnail and keep it in view) and *writes* to it on an
 * explicit thumbnail click. Panning or scrolling the strip on its own
 * never changes the selection — selection and scroll position are
 * intentionally decoupled in that direction.
 */
export function GalleryNavigation({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
}: GalleryNavigationProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const { isDragging } = useHorizontalScroll(stripRef);

  // When selection changes from elsewhere (previous/next controls),
  // keep the strip's highlighted thumbnail in view. This never runs in
  // response to the user scrolling the strip itself.
  useEffect(() => {
    activeThumbnailRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedArtworkId]);

  return (
    <nav className={styles.navigation} aria-label="Artwork collection">
      <div
        ref={stripRef}
        className={`${styles.strip} ${isDragging ? styles.dragging : ''}`}
      >
        {artworks.map((artwork) => {
          const isActive = artwork.id === selectedArtworkId;
          return (
            <ArtworkThumbnail
              key={artwork.id}
              ref={isActive ? activeThumbnailRef : undefined}
              artwork={artwork}
              isActive={isActive}
              onSelect={onSelectArtwork}
            />
          );
        })}
      </div>
    </nav>
  );
}
