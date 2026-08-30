import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import type { Artwork } from '@/types/artwork';
import { clamp } from '@/utils';
import './NavWindow.css';

interface ItemRect {
  left: number;
  width: number;
}

interface NavWindowProps {
  /** The (now static) strip's own container — measured directly for
   * real pixel positions rather than duplicating its CSS constants. */
  trackRef: RefObject<HTMLDivElement | null>;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (artworkId: string) => void;
  /** Live "what's centered in the window right now" readout, for the
   * strip's plaque caption. Not itself a selection signal. */
  onCenteredIndexChange?: (index: number) => void;
}

// Deliberately a fractional multiple of an item's width — the window is
// a free, continuous span rather than a whole number of thumbnails, so
// it naturally reveals a partial sliver of the items at one or both
// edges instead of always aligning cleanly.
const WINDOW_ITEM_SPAN = 3.4;
const WHEEL_SPEED = 0.6;

/**
 * Draggable minimap-style viewport window overlaid on the nav strip.
 * The strip itself never moves — this window is the only thing that
 * does, via drag, wheel/trackpad scroll, or an eased glide when the
 * selection changes elsewhere. Position and width are continuous pixel
 * values measured from the strip's real layout, never quantized to
 * item boundaries.
 */
export function NavWindow({
  trackRef,
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  onCenteredIndexChange,
}: NavWindowProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [itemRects, setItemRects] = useState<ItemRect[]>([]);
  const [windowLeft, setWindowLeft] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false); // true only for the eased glide

  const dragRef = useRef({ active: false, startX: 0, startLeft: 0 });
  // Mirrors whichever artwork this window itself last reported via
  // onSelectArtwork, so the sync effect below can tell "selection
  // changed because we scrubbed it" apart from "selection changed
  // elsewhere" — same role ArtworkViewer's `activeId` plays for its
  // own scroll-vs-programmatic-scroll distinction.
  const activeIdRef = useRef<string | null>(selectedArtworkId);
  const didInitialCenterRef = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    setTrackWidth(trackRect.width);
    setItemRects(
      Array.from(track.querySelectorAll<HTMLElement>('.artwork-thumbnail')).map((el) => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left - trackRect.left, width: rect.width };
      }),
    );
  }, [trackRef]);

  useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, artworks.length]);

  const itemWidth = itemRects[0]?.width ?? 0;
  const windowWidth =
    itemRects.length > 0 ? Math.min(itemWidth * WINDOW_ITEM_SPAN, trackWidth) : 0;
  const maxLeft = Math.max(0, trackWidth - windowWidth);

  // Nearest item to a given window-left position's center — drives
  // both the live selection scrub and the plaque readout.
  const nearestIndexAt = useCallback(
    (left: number) => {
      if (itemRects.length === 0) return -1;
      const center = left + windowWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      itemRects.forEach((rect, index) => {
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    },
    [itemRects, windowWidth],
  );

  const centerFor = useCallback(
    (index: number) => {
      const rect = itemRects[index];
      if (!rect) return 0;
      return clamp(rect.left + rect.width / 2 - windowWidth / 2, 0, maxLeft);
    },
    [itemRects, windowWidth, maxLeft],
  );

  // Live "what's centered" readout, plus — on a genuine change — tells
  // the parent this is the new selection. Recorded in activeIdRef
  // first so the external-change sync effect below reads this as our
  // own echo rather than a change from elsewhere.
  const reportCentered = useCallback(
    (left: number) => {
      const index = nearestIndexAt(left);
      onCenteredIndexChange?.(index);
      const artwork = artworks[index];
      if (!artwork || artwork.id === activeIdRef.current) return;
      activeIdRef.current = artwork.id;
      onSelectArtwork(artwork.id);
    },
    [artworks, nearestIndexAt, onCenteredIndexChange, onSelectArtwork],
  );

  // Initial placement, once the strip has actually been measured —
  // centers on whatever's already selected, with no transition.
  useLayoutEffect(() => {
    if (didInitialCenterRef.current || itemRects.length === 0) return;
    didInitialCenterRef.current = true;
    const index = Math.max(0, artworks.findIndex((artwork) => artwork.id === selectedArtworkId));
    setWindowLeft(centerFor(index));
    onCenteredIndexChange?.(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemRects.length]);

  // Selection changed from elsewhere — a thumbnail click, the
  // previous/next controls, an arrow key, or the visitor scrolling the
  // main wall — so glide to re-center on it. Skipped for changes this
  // window echoed itself (see reportCentered above).
  useEffect(() => {
    if (!selectedArtworkId || selectedArtworkId === activeIdRef.current) return;
    activeIdRef.current = selectedArtworkId;
    const index = artworks.findIndex((artwork) => artwork.id === selectedArtworkId);
    if (index < 0) return;
    setSettling(true);
    setWindowLeft(centerFor(index));
    onCenteredIndexChange?.(index);
  }, [selectedArtworkId, artworks, centerFor, onCenteredIndexChange]);

  // Re-clamp (never animated) if the strip's own layout changes the
  // available range, e.g. a viewport resize.
  useEffect(() => {
    setWindowLeft((current) => clamp(current, 0, maxLeft));
  }, [maxLeft]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      dragRef.current = { active: true, startX: event.clientX, startLeft: windowLeft };
      setDragging(true);
      setSettling(false);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [windowLeft],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active) return;
      const delta = event.clientX - dragRef.current.startX;
      const next = clamp(dragRef.current.startLeft + delta, 0, maxLeft);
      setWindowLeft(next);
      reportCentered(next);
    },
    [maxLeft, reportCentered],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
    setDragging(false);
  }, []);

  const onWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const next = clamp(windowLeft + delta * WHEEL_SPEED, 0, maxLeft);
      setSettling(false);
      setWindowLeft(next);
      reportCentered(next);
    },
    [windowLeft, maxLeft, reportCentered],
  );

  if (artworks.length === 0 || itemRects.length === 0) return null;

  return (
    <div
      className="nav-window"
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
      onTransitionEnd={() => setSettling(false)}
      style={{
        left: windowLeft,
        width: windowWidth,
        cursor: dragging ? 'grabbing' : 'grab',
        transition: settling ? 'left 0.4s cubic-bezier(.2, .8, .2, 1)' : 'none',
      }}
    >
      <span className="nav-window-grip nav-window-grip-left" />
      <span className="nav-window-grip nav-window-grip-right" />
      <span className="nav-window-corner nav-window-corner-tl" />
      <span className="nav-window-corner nav-window-corner-tr" />
      <span className="nav-window-corner nav-window-corner-bl" />
      <span className="nav-window-corner nav-window-corner-br" />
    </div>
  );
}
