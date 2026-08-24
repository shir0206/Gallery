import { useEffect, useRef, useState, type RefObject } from 'react';

const DRAG_THRESHOLD_PX = 4;

/**
 * Makes a horizontally-overflowing element pan naturally for every input
 * device:
 *
 * - Touch and trackpad: already work natively (overflow-x: auto).
 * - Mouse wheel: a plain vertical wheel gesture is redirected to
 *   horizontal scroll, so users don't need to hold Shift.
 * - Mouse: click-and-drag pans the strip like a filmstrip, rather than
 *   requiring the visible scrollbar to be grabbed.
 *
 * Drag state is exposed so the caller can swap in a "grabbing" cursor,
 * and a drag past a small threshold suppresses the thumbnail's click so
 * a pan doesn't accidentally select an artwork.
 */
export function useHorizontalScroll(ref: RefObject<HTMLElement | null>) {
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      // Only hijack plain vertical wheel input. If the gesture already
      // has meaningful horizontal movement (trackpad, Shift+wheel),
      // let the browser's native handling do its thing.
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;

      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragState.current = {
        active: true,
        startX: event.clientX,
        startScrollLeft: el.scrollLeft,
        moved: false,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState.current.active) return;
      const delta = event.clientX - dragState.current.startX;

      if (!dragState.current.moved && Math.abs(delta) > DRAG_THRESHOLD_PX) {
        dragState.current.moved = true;
        setIsDragging(true);
      }
      if (dragState.current.moved) {
        el.scrollLeft = dragState.current.startScrollLeft - delta;
      }
    };

    const endDrag = () => {
      if (dragState.current.moved) {
        // Swallow the click that a drag-release would otherwise fire,
        // so panning never accidentally selects a thumbnail.
        const suppressClick = (event: MouseEvent) => {
          event.stopPropagation();
          event.preventDefault();
        };
        el.addEventListener('click', suppressClick, { capture: true, once: true });
      }
      dragState.current.active = false;
      dragState.current.moved = false;
      setIsDragging(false);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [ref]);

  return { isDragging };
}
