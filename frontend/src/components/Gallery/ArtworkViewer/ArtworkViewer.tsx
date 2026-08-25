import { useEffect, useRef, useState } from 'react';
import type { Artwork } from '@/types/artwork';
import { ArtworkDetails } from './ArtworkDetails/ArtworkDetails';
import './ArtworkViewer.css';

interface ArtworkViewerProps {
  artwork: Artwork | null;
  onPrevious: () => void;
  onNext: () => void;
  /** Hide the prev/next controls entirely when there's nothing to step to. */
  hasMultiple: boolean;
  /** Opens the editorial feature-spread view (ArtworkPage) for the current artwork. Omit to hide the link. */
  onOpenFeature?: (artworkId: string) => void;
}

// Must match the crossfade keyframe duration in ArtworkViewer.css —
// it's how long the outgoing image layer stays mounted before we drop it.
const CROSSFADE_MS = 550;

/**
 * Large, prominent, centered display for the currently selected
 * artwork, paired with its details panel. Re-renders dynamically as
 * `artwork` changes (driven by Gallery's selection state — either a
 * thumbnail click, the previous/next controls, or a thumbnail-strip
 * click).
 *
 * Switching artworks crossfades the new image over the outgoing one
 * within the same frame — both are briefly layered and animate
 * opacity/scale together — rather than hard-cutting or remounting the
 * whole viewer. That keeps the piece reading as one continuous
 * exhibit rather than a carousel slide. The details panel gets its
 * own light fade, offset slightly, so the reveal feels staggered
 * rather than everything blinking at once.
 */
export function ArtworkViewer({
  artwork,
  onPrevious,
  onNext,
  hasMultiple,
  onOpenFeature,
}: ArtworkViewerProps) {
  const previousArtworkRef = useRef<Artwork | null>(artwork);
  const [outgoing, setOutgoing] = useState<Artwork | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const previous = previousArtworkRef.current;
    previousArtworkRef.current = artwork;

    if (!artwork || !previous || previous.id === artwork.id) {
      return;
    }

    if (clearTimeoutRef.current !== null) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Hard cut, no layered crossfade — the incoming <img> simply
      // replaces the outgoing one with no animation (handled in CSS).
      setOutgoing(null);
      return;
    }

    setOutgoing(previous);
    clearTimeoutRef.current = setTimeout(() => {
      setOutgoing(null);
      clearTimeoutRef.current = null;
    }, CROSSFADE_MS);
  }, [artwork]);

  // Don't leave a dangling timeout if the viewer unmounts mid-transition.
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current !== null) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  if (!artwork) {
    return (
      <div className="artwork-viewer">
        <p className="artwork-viewer-empty">No artwork selected.</p>
      </div>
    );
  }

  const { width, height } = artwork.dimensions;

  return (
    <div className="artwork-viewer" role="region" aria-label="Selected artwork">
      {hasMultiple && (
        <button
          type="button"
          className="artwork-viewer-nav-button artwork-viewer-nav-button-prev"
          onClick={onPrevious}
          aria-label="Previous artwork"
        >
          ‹
        </button>
      )}

      <div
        className="artwork-viewer-frame"
        data-orientation={artwork.orientation}
        // Real physical proportions, known before the image loads,
        // reserve the right box shape up front so nothing jumps around
        // once the image arrives — and it's exactly the aspect ratio
        // object-fit: contain will preserve. The layered img elements
        // below fill this box completely (position: absolute, inset: 0).
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {outgoing && (
          <img
            key={outgoing.id}
            src={outgoing.imageUrl}
            alt=""
            aria-hidden="true"
            className="artwork-viewer-image artwork-viewer-image-outgoing"
          />
        )}
        <img
          key={artwork.id}
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          className="artwork-viewer-image artwork-viewer-image-incoming"
        />
      </div>

      <ArtworkDetails
        key={artwork.id}
        artwork={artwork}
        onOpenFeature={onOpenFeature ? () => onOpenFeature(artwork.id) : undefined}
      />

      {hasMultiple && (
        <button
          type="button"
          className="artwork-viewer-nav-button artwork-viewer-nav-button-next"
          onClick={onNext}
          aria-label="Next artwork"
        >
          ›
        </button>
      )}
    </div>
  );
}
