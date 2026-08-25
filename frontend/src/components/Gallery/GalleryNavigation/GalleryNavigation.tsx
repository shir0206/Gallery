import { useEffect, useRef } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkThumbnail } from './ArtworkThumbnail/ArtworkThumbnail';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import './GalleryNavigation.css';

interface GalleryNavigationProps {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  /** Which artworks are currently hanging on the wall (reported by
   * ArtworkViewer's own IntersectionObserver), as opposed to just the
   * single active `selectedArtworkId`. Drives thumbnail opacity — a
   * thumbnail is "lit" when its artwork is in this set, regardless of
   * whether the thumbnail itself is scrolled into view within the
   * strip. */
  visibleArtworkIds: Set<string>;
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
 *
 * Thumbnail opacity comes straight from `visibleArtworkIds` — which
 * artworks are actually hanging on the wall above right now — not
 * from anything about the strip's own scroll position. Scrolling or
 * dragging the strip to browse the full collection never changes
 * which thumbnails are lit.
 */
export function GalleryNavigation({
  artworks,
  selectedArtworkId,
  visibleArtworkIds,
  onSelectArtwork,
}: GalleryNavigationProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const { isDragging } = useHorizontalScroll(stripRef);

  // When selection changes from elsewhere (previous/next controls),
  // keep the strip's highlighted thumbnail in view. This never runs in
  // response to the user scrolling the strip itself.
  useEffect(() => {
    if (!selectedArtworkId) return;
    thumbnailRefs.current.get(selectedArtworkId)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedArtworkId]);

  return (
    <nav className="gallery-navigation" aria-label="Artwork collection">
      <div className="gallery-navigation-card">
        <div
          ref={stripRef}
          className={`gallery-navigation-strip ${isDragging ? 'gallery-navigation-dragging' : ''}`}
        >
          {artworks.map((artwork) => {
            const isActive = artwork.id === selectedArtworkId;
            return (
              <ArtworkThumbnail
                key={artwork.id}
                ref={(el) => {
                  if (el) thumbnailRefs.current.set(artwork.id, el);
                  else thumbnailRefs.current.delete(artwork.id);
                }}
                artwork={artwork}
                isActive={isActive}
                isVisible={visibleArtworkIds.has(artwork.id)}
                onSelect={onSelectArtwork}
              />
            );
          })}
        </div>
        {/* Decorative drag affordance for the card itself — independent
            of any single thumbnail, it just signals "this whole strip
            pans". */}
        <div className="gallery-navigation-grab-dot" aria-hidden="true" />
      </div>
    </nav>
  );
}
