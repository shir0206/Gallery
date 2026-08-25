import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ArtworkCollectionResponse } from '@/types/artwork';
import { GalleryBackground } from './GalleryBackground/GalleryBackground';
import { GalleryNavigation } from './GalleryNavigation/GalleryNavigation';
import { ArtworkViewer, type ArtworkScrollProgress } from './ArtworkViewer/ArtworkViewer';
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
 * Selection state (`selectedArtworkId`) lives here as the single
 * source of truth for "which artwork is currently open". Unlike
 * GalleryNavigation's thumbnail strip — which only *reads* the
 * selection and *writes* to it on an explicit click — ArtworkViewer
 * now renders the whole collection as one scrollable wall and both
 * reads and writes this same state: it scrolls to the selected piece
 * when the selection changes elsewhere, and reports back up
 * (`onSelectArtwork`) whenever the visitor's own scrolling settles on
 * a different piece. `scrollProgress` is a second, higher-frequency
 * signal (0–100% along the wall) that isn't part of the selection
 * "context" itself but rides alongside it for a live position readout.
 */
export function Gallery({ data, onOpenFeature, onExitWall }: GalleryProps) {
  const { environment, artworks } = data;
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(
    artworks[0]?.id ?? null,
  );
  // Live scroll readout from ArtworkViewer — how far along the wall
  // the visitor currently is (0-100%, left to right). Kept separate
  // from `selectedArtworkId` because it updates on every scroll frame,
  // while the selection only updates once scrolling settles on a new
  // artwork; folding both into one state would re-render on every frame.
  const [scrollProgress, setScrollProgress] = useState(0);

  const selectedIndex = useMemo(
    () => artworks.findIndex((artwork) => artwork.id === selectedArtworkId),
    [artworks, selectedArtworkId],
  );
  const selectedArtwork = selectedIndex >= 0 ? artworks[selectedIndex] : null;

  const handleScrollProgress = useCallback((info: ArtworkScrollProgress) => {
    setScrollProgress(info.progress);
  }, []);

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
    <div className="gallery" data-scroll-progress={Math.round(scrollProgress)}>
      <GalleryBackground environment={environment} />
      {onExitWall && (
        <button type="button" className="gallery-exit-button" onClick={onExitWall}>
          ← Grid view
        </button>
      )}
      <ArtworkViewer
        artworks={artworks}
        selectedArtworkId={selectedArtworkId}
        onSelectArtwork={setSelectedArtworkId}
        onScrollProgress={handleScrollProgress}
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
          `Now viewing ${selectedArtwork.title} by ${selectedArtwork.artist}, ${selectedIndex + 1} of ${artworks.length}, ${Math.round(scrollProgress)}% along the wall`}
      </div>
    </div>
  );
}
