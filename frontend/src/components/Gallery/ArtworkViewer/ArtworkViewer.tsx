import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Artwork } from "../../../types/artwork";
import { useHorizontalScroll } from "../../../hooks/useHorizontalScroll";
import "./ArtworkViewer.css";

/** Reported on every scroll tick so the parent can drive a progress
 * readout, and on every settle so it can update selection state. */
export interface ArtworkScrollProgress {
  /** 0–100, how far the wall has been scrolled from its left edge to its right edge. */
  progress: number;
  /** Whichever artwork is currently most centered in the viewport. */
  artworkId: string;
  index: number;
}

interface ArtworkViewerProps {
  artworks: Artwork[];
  /** The single source of truth for "which artwork is open" — same role
   * this prop plays in GalleryNavigation. The viewer reads it to scroll
   * a piece into view when the selection changes elsewhere (e.g. a
   * thumbnail click), and writes back to it (via onSelectArtwork) once
   * the visitor's own scrolling settles on a different piece. */
  selectedArtworkId: string | null;
  /** Called when the artwork most centered in view changes — this is
   * how the wall updates the shared selection ("context") as the
   * visitor scrolls past pieces, not just on explicit clicks. */
  onSelectArtwork: (artworkId: string) => void;
  /** Fires on every scroll frame with the live scroll percentage
   * (left → right) and whichever artwork is currently centered. Use
   * this for a live "XX%" readout; use onSelectArtwork if you only
   * care about discrete "which artwork is showing" changes. */
  onScrollProgress?: (info: ArtworkScrollProgress) => void;
  /** Opens the editorial feature-spread view (ArtworkPage) for the current artwork. Omit to hide the affordance. */
  onOpenFeature?: (artworkId: string) => void;
}

/**
 * Renders the entire collection as one continuous, horizontally
 * scrollable wall — every artwork hung side by side — rather than a
 * single centered piece with prev/next controls. Scroll position (via
 * native touch/trackpad panning, `useHorizontalScroll`'s wheel/drag
 * support, or a thumbnail click) is the only way to move through it.
 *
 * As the visitor scrolls, the viewer tracks two things continuously:
 *  - overall progress along the wall, 0–100% left to right
 *  - whichever single artwork is currently most centered in view
 *
 * Both are reported upward (`onScrollProgress`, `onSelectArtwork`) so
 * the parent's selection state — the shared "context" for which piece
 * is current — stays in sync with what's actually on screen, not just
 * with explicit clicks.
 */
export function ArtworkViewer({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  onScrollProgress,
  onOpenFeature,
}: ArtworkViewerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const { isDragging } = useHorizontalScroll(trackRef);

  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(selectedArtworkId);

  // Set while we're driving a scroll ourselves (selection changed
  // elsewhere, e.g. a thumbnail click) so the scroll handler doesn't
  // read our own programmatic scroll as a fresh visitor-driven update.
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const activeIndex = useMemo(
    () => artworks.findIndex((artwork) => artwork.id === activeId),
    [artworks, activeId]
  );

  // Reads the DOM directly (scrollLeft + each item's bounding rect)
  // rather than IntersectionObserver ratios — artworks vary widely in
  // width (portrait vs landscape), so "closest item center to the
  // viewport center" is a more reliable read of "what's the visitor
  // actually looking at" than raw visible-area overlap.
  const readScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track || artworks.length === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScroll = scrollWidth - clientWidth;
    const nextProgress =
      maxScroll > 0
        ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100))
        : 0;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let closestId: string | null = null;
    let closestIndex = -1;
    let closestDistance = Infinity;

    artworks.forEach((artwork, index) => {
      const el = itemRefs.current.get(artwork.id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(itemCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = artwork.id;
        closestIndex = index;
      }
    });

    setProgress(nextProgress);

    if (closestId) {
      onScrollProgress?.({
        progress: nextProgress,
        artworkId: closestId,
        index: closestIndex,
      });
    }

    if (closestId && closestId !== activeId) {
      setActiveId(closestId);
      onSelectArtwork(closestId);
    }
  }, [artworks, activeId, onScrollProgress, onSelectArtwork]);

  // Track native scroll (touch, trackpad, wheel-via-useHorizontalScroll,
  // or drag-via-useHorizontalScroll) at animation-frame cadence.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (isProgrammaticScrollRef.current) return;
        readScrollState();
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    // Establish an initial reading on mount / whenever the collection changes.
    readScrollState();

    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworks]);

  // When selection changes from elsewhere (a thumbnail click, the
  // previous/next controls, arrow keys), scroll that artwork to the
  // center of the wall. Guarded against re-triggering the scroll
  // handler above so this doesn't fight the visitor's own scrolling.
  useEffect(() => {
    if (!selectedArtworkId || selectedArtworkId === activeId) return;
    const el = itemRefs.current.get(selectedArtworkId);
    if (!el) return;

    isProgrammaticScrollRef.current = true;
    setActiveId(selectedArtworkId);
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    if (programmaticScrollTimeoutRef.current !== null) {
      clearTimeout(programmaticScrollTimeoutRef.current);
    }
    programmaticScrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      readScrollState();
      programmaticScrollTimeoutRef.current = null;
    }, 600);

    return () => {
      if (programmaticScrollTimeoutRef.current !== null) {
        clearTimeout(programmaticScrollTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtworkId]);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimeoutRef.current !== null) {
        clearTimeout(programmaticScrollTimeoutRef.current);
      }
    };
  }, []);

  if (artworks.length === 0) {
    return (
      <div className="artwork-viewer">
        <p className="artwork-viewer-empty">No artwork selected.</p>
      </div>
    );
  }

  const activeArtwork = activeIndex >= 0 ? artworks[activeIndex] : artworks[0];

  return (
    <div className="artwork-viewer" role="region" aria-label="Artwork wall">
      <div className="artwork-viewer-progress">
        <div
          className="artwork-viewer-progress-track"
          role="progressbar"
          aria-label="Scroll position along the wall"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="artwork-viewer-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="artwork-viewer-progress-label">
          {activeArtwork.title}
          <span className="artwork-viewer-progress-label-muted">
            {" "}
            · {activeIndex + 1}/{artworks.length} · {Math.round(progress)}%
          </span>
        </span>
      </div>

      <div
        ref={trackRef}
        className={`artwork-viewer-track ${
          isDragging ? "artwork-viewer-dragging" : ""
        }`}
      >
        {artworks.map((artwork) => {
          const { width, height } = artwork.dimensions;
          const isActive = artwork.id === activeId;
          return (
            <div
              key={artwork.id}
              ref={(el) => {
                if (el) itemRefs.current.set(artwork.id, el);
                else itemRefs.current.delete(artwork.id);
              }}
              className="artwork-viewer-frame"
              data-orientation={artwork.orientation}
            >
              {onOpenFeature ? (
                <button
                  type="button"
                  className="artwork-viewer-image-button"
                  onClick={() => onOpenFeature(artwork.id)}
                  aria-label={`Open ${artwork.title} by ${artwork.artist}`}
                >
                  <img
                    src={artwork.imageUrl}
                    alt={`${artwork.title} by ${artwork.artist}`}
                    className="artwork-viewer-image"
                    loading="lazy"
                  />
                </button>
              ) : (
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} by ${artwork.artist}`}
                  className="artwork-viewer-image"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
