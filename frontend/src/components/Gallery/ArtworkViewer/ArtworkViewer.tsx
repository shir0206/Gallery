import { useCallback, useEffect, useRef, useState } from "react";
import type { Artwork } from "../../../types/artwork";
import { useHorizontalScroll } from "../../../hooks/useHorizontalScroll";
import { ArtworkPurchaseCta } from "./ArtworkPurchaseCta/ArtworkPurchaseCta";
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
  /** Fires whenever the *set* of artworks currently hanging in the
   * wall's own viewport changes — not just the single centered piece
   * `onSelectArtwork` tracks. This is what lets the nav strip below
   * light up every thumbnail currently on screen (e.g. 3 on a wide
   * viewport, 1-2 on a narrow one), not only the active one. */
  onVisibleArtworksChange?: (artworkIds: Set<string>) => void;
  /** Opens the editorial feature-spread view (ArtworkPage) for the current artwork. Omit to hide the affordance. */
  onOpenFeature?: (artworkId: string) => void;
}

// An artwork counts as "on the wall" once at least this fraction of it
// intersects the wall's own viewport. Lower than the nav strip's
// equivalent threshold (which wants thumbnails *fully* in view)
// because artwork frames vary far more in size — a large portrait can
// be wider than the viewport itself, so requiring near-total overlap
// would mean it never counts as visible at all.
const WALL_VISIBLE_THRESHOLD = 0.5;

// No further scroll events within this window after a programmatic
// scroll starts ⇒ treat it as settled. A fixed guessed duration (the
// previous approach) reads as "settled" mid-animation for any scroll
// that happens to take longer, which re-derives selection from a
// still-moving position and visibly snaps it back — this instead
// tracks the scroll's own real end.
const SCROLL_SETTLE_IDLE_MS = 120;

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
  onVisibleArtworksChange,
  onOpenFeature,
}: ArtworkViewerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const { isDragging } = useHorizontalScroll(trackRef);

  const [activeId, setActiveId] = useState<string | null>(selectedArtworkId);
  // Tracked in a ref alongside the callback so the observer below can
  // read/update membership without needing to re-subscribe itself.
  const visibleIdsRef = useRef<Set<string>>(new Set());

  // Set while we're driving a scroll ourselves (selection changed
  // elsewhere, e.g. a thumbnail click) so the scroll handler doesn't
  // read our own programmatic scroll as a fresh visitor-driven update.
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Reads the DOM directly (scrollLeft + each item's bounding rect)
  // rather than IntersectionObserver ratios — artworks vary widely in
  // width (portrait vs landscape), so "closest item center to the
  // viewport center" is a more reliable read of "what's the visitor
  // actually looking at" than raw visible-area overlap.
  // `allowSelectionChange` is false right after a programmatic scroll
  // settles: `scrollIntoView` clamps rather than truly centering items
  // near either end of the wall (nothing to scroll past), so "closest
  // item to viewport center" can legitimately be a neighbor of the
  // artwork that was actually scrolled to. Re-deriving selection from
  // that geometry at settle-time would second-guess the explicit
  // selection this same scroll was driven by. Progress still updates
  // either way — only the artworkId/index it's paired with, and the
  // isActive-selection side effect, are skipped.
  const readScrollState = useCallback((allowSelectionChange = true) => {
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

    if (closestId) {
      onScrollProgress?.({
        progress: nextProgress,
        artworkId: closestId,
        index: closestIndex,
      });
    }

    if (allowSelectionChange && closestId && closestId !== activeId) {
      setActiveId(closestId);
      onSelectArtwork(closestId);
    }
  }, [artworks, activeId, onScrollProgress, onSelectArtwork]);

  // (Re)starts the "has the programmatic scroll actually stopped?"
  // check. Called once when a programmatic scroll begins, and again on
  // every scroll event while one is in flight — so it only fires once
  // scroll events truly stop arriving, rather than after a guessed delay.
  const scheduleSettleCheck = useCallback(() => {
    if (programmaticScrollTimeoutRef.current !== null) {
      clearTimeout(programmaticScrollTimeoutRef.current);
    }
    programmaticScrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      programmaticScrollTimeoutRef.current = null;
      readScrollState(false);
    }, SCROLL_SETTLE_IDLE_MS);
  }, [readScrollState]);

  const cancelSettleCheck = useCallback(() => {
    if (programmaticScrollTimeoutRef.current !== null) {
      clearTimeout(programmaticScrollTimeoutRef.current);
      programmaticScrollTimeoutRef.current = null;
    }
  }, []);

  // Track native scroll (touch, trackpad, wheel-via-useHorizontalScroll,
  // or drag-via-useHorizontalScroll) at animation-frame cadence.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) {
        // Still moving toward its target (or the visitor hasn't taken
        // over yet) — push the settle check back out rather than
        // reading a still-moving position.
        scheduleSettleCheck();
        return;
      }
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        readScrollState();
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    // Establish an initial progress reading on mount / whenever the
    // collection changes. Selection changes are suppressed here: at
    // scrollLeft 0 several frames are visible at once, and the one
    // nearest the viewport's geometric center is often not the first
    // artwork — reading that as "the visitor is looking at this" would
    // override the intended initial selection before any real
    // scrolling happened.
    readScrollState(false);

    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworks]);

  // A visitor grabbing the wall themselves — touch, mouse-drag (via
  // useHorizontalScroll), or a wheel nudge — takes over immediately,
  // rather than being made to fight the tail end of an in-flight
  // programmatic scroll until its own settle check fires.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleUserInput = () => {
      if (!isProgrammaticScrollRef.current) return;
      isProgrammaticScrollRef.current = false;
      cancelSettleCheck();
    };

    track.addEventListener("pointerdown", handleUserInput);
    track.addEventListener("wheel", handleUserInput, { passive: true });
    return () => {
      track.removeEventListener("pointerdown", handleUserInput);
      track.removeEventListener("wheel", handleUserInput);
    };
  }, [cancelSettleCheck]);

  // Separate from readScrollState above: this tracks the *set* of
  // every artwork currently intersecting the wall's viewport, rooted
  // on the track itself (same pattern GalleryNavigation used to run
  // for its own thumbnails). readScrollState answers "what's most
  // centered" for selection purposes; this answers "what's showing
  // right now at all", which is what the nav strip needs to decide
  // which thumbnails to light up.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(visibleIdsRef.current);
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-artwork-id");
          if (!id) return;
          const isOnWall =
            entry.isIntersecting &&
            entry.intersectionRatio >= WALL_VISIBLE_THRESHOLD;
          if (isOnWall) next.add(id);
          else next.delete(id);
        });
        visibleIdsRef.current = next;
        onVisibleArtworksChange?.(next);
      },
      { root: track, threshold: [0, WALL_VISIBLE_THRESHOLD, 1] }
    );

    itemRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
    // Scroll events (below) keep pushing this back out for as long as
    // the browser is still animating; this covers the case where the
    // target is already in view and no scroll events fire at all.
    scheduleSettleCheck();

    return cancelSettleCheck;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtworkId]);

  useEffect(() => cancelSettleCheck, [cancelSettleCheck]);

  if (artworks.length === 0) {
    return (
      <div className="artwork-viewer">
        <p className="artwork-viewer-empty">No artwork selected.</p>
      </div>
    );
  }

  return (
    <div className="artwork-viewer" role="region" aria-label="Artwork wall">
      <div
        ref={trackRef}
        className={`artwork-viewer-track ${
          isDragging ? "artwork-viewer-dragging" : ""
        }`}
      >
        {artworks.map((artwork) => {
          return (
            <div
              key={artwork.id}
              ref={(el) => {
                if (el) itemRefs.current.set(artwork.id, el);
                else itemRefs.current.delete(artwork.id);
              }}
              className="artwork-viewer-frame"
              data-orientation={artwork.orientation}
              data-artwork-id={artwork.id}
            >
              <div className="artwork-viewer-media">
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
                <ArtworkPurchaseCta artwork={artwork} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
