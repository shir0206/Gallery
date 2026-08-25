import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ArtworkCollectionResponse } from '@/types/artwork';
import { GalleryBackground } from './GalleryBackground/GalleryBackground';
import { GalleryNavigation } from './GalleryNavigation/GalleryNavigation';
import { ArtworkViewer } from './ArtworkViewer/ArtworkViewer';
import './Gallery.css';

interface GalleryProps {
  data: ArtworkCollectionResponse;
  /** Opens the editorial feature-spread view (ArtworkPage) for the given artwork id. Omit to hide the link. */
  onOpenFeature?: (artworkId: string) => void;
  /** Returns to the HomePage grid. Omit to hide the exit control (e.g. if the wall is the only view). */
  onExitWall?: () => void;
}

/**
 * Top-level gallery composition: background environment,
 * the main artwork viewer, and the bottom navigation strip.
 *
 * Selection state lives here for Phase 1 (single source of truth for
 * "which artwork is currently open"). Phase 8 adds previous/next
 * stepping on top of that same state — the navigation strip only ever
 * *reads* the selection to highlight the active thumbnail and *writes*
 * to it on an explicit click; scrolling the strip never touches it.
 */
export function Gallery({ data, onOpenFeature, onExitWall }: GalleryProps) {
  const { environment, artworks } = data;
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(
    artworks[0]?.id ?? null,
  );

  const selectedIndex = useMemo(
    () => artworks.findIndex((artwork) => artwork.id === selectedArtworkId),
    [artworks, selectedArtworkId],
  );
  const selectedArtwork = selectedIndex >= 0 ? artworks[selectedIndex] : null;

  // Wrap around at either end, so "next" from the last piece returns to
  // the first and vice versa — the collection reads as a loop rather
  // than a dead-ended list.
  const goToPrevious = useCallback(() => {
    if (artworks.length === 0) return;
    setSelectedArtworkId((currentId) => {
      const currentIndex = artworks.findIndex((artwork) => artwork.id === currentId);
      const previousIndex = currentIndex <= 0 ? artworks.length - 1 : currentIndex - 1;
      return artworks[previousIndex].id;
    });
  }, [artworks]);

  const goToNext = useCallback(() => {
    if (artworks.length === 0) return;
    setSelectedArtworkId((currentId) => {
      const currentIndex = artworks.findIndex((artwork) => artwork.id === currentId);
      const nextIndex = currentIndex >= artworks.length - 1 ? 0 : currentIndex + 1;
      return artworks[nextIndex].id;
    });
  }, [artworks]);

  // Left/right arrow keys mirror the on-screen previous/next controls.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTypingTarget) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  return (
    <div className="gallery">
      <GalleryBackground environment={environment} />
      {onExitWall && (
        <button type="button" className="gallery-exit-button" onClick={onExitWall}>
          ← Grid view
        </button>
      )}
      <ArtworkViewer
        artwork={selectedArtwork}
        onPrevious={goToPrevious}
        onNext={goToNext}
        hasMultiple={artworks.length > 1}
        onOpenFeature={onOpenFeature}
      />
      <GalleryNavigation
        artworks={artworks}
        selectedArtworkId={selectedArtworkId}
        onSelectArtwork={setSelectedArtworkId}
      />
      {/* Announces the current artwork on every selection change —
          click, previous/next controls, or the Left/Right arrow-key
          shortcuts. Those shortcuts move the *selection* without
          necessarily moving keyboard focus, so this is the only
          reliable way a screen reader user hears that the gallery
          advanced. Kept out of the visible layout entirely. */}
      <div aria-live="polite" className="visually-hidden">
        {selectedArtwork &&
          `Now viewing ${selectedArtwork.title} by ${selectedArtwork.artist}, ${selectedIndex + 1} of ${artworks.length}`}
      </div>
    </div>
  );
}
