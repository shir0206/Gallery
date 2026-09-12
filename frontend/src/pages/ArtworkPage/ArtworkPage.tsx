import { useCallback, useEffect, useRef, useState } from "react";
import type { Artwork } from "@/types/artwork";
import { ArtworkOverview } from "./sections/ArtworkOverview";
import { DetailsSection } from "./sections/DetailsSection";
import "./ArtworkPage.css";

type TransitionPhase =
  | "idle"
  | "focus"
  | "isolate"
  | "title"
  | "ready"
  | "closing";
interface ArtworkPageProps {
  artwork: Artwork;
  onBack?: () => void;
  onScrollBack?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onAddToCart: (artworkId: string) => void;
  isCovered?: boolean;
  transitionPhase?: TransitionPhase;
  usesSharedArtwork?: boolean;
  browseDirection?: "previous" | "next" | null;
  isStaticPreview?: boolean;
  isDirectEntry?: boolean;
}

export function ArtworkPage({
  artwork,
  onBack,
  onScrollBack,
  onPrevious,
  onNext,
  onAddToCart,
  isCovered = false,
  transitionPhase = "ready",
  usesSharedArtwork = false,
  browseDirection = null,
  isStaticPreview = false,
  isDirectEntry = false,
}: ArtworkPageProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const introTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isScrollBackRequestedRef = useRef(false);
  const [isIntroLocked, setIsIntroLocked] = useState(
    !usesSharedArtwork && !isStaticPreview
  );
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [artwork.id]);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsIntroLocked(!usesSharedArtwork && !isStaticPreview);
    });
    return () => {
      cancelled = true;
      if (introTimerRef.current !== null)
        window.clearTimeout(introTimerRef.current);
    };
  }, [artwork.id, usesSharedArtwork, isStaticPreview]);
  const handleIntroReady = useCallback(() => {
    if (usesSharedArtwork) return;
    if (introTimerRef.current !== null)
      window.clearTimeout(introTimerRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsIntroLocked(false);
      return;
    }
    introTimerRef.current = window.setTimeout(
      () => setIsIntroLocked(false),
      525
    );
  }, [usesSharedArtwork]);
  useEffect(() => {
    if (isCovered) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack?.();
      else if (event.key === "ArrowLeft") onPrevious?.();
      else if (event.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isCovered, onBack, onPrevious, onNext]);
  useEffect(() => {
    isScrollBackRequestedRef.current = false;
  }, [artwork.id]);
  const scrollToStage = useCallback((stage: "00" | "01" | "02") => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const overview = scroller.querySelector<HTMLElement>(
      ".artwork-presentation-track"
    );
    const details = scroller.querySelector<HTMLElement>(".details-section");
    if (!overview || !details) return;
    const top =
      stage === "00"
        ? overview.offsetTop
        : stage === "01"
        ? overview.offsetTop +
          Math.max(0, overview.offsetHeight - scroller.clientHeight)
        : details.offsetTop;
    scroller.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || isCovered || !onScrollBack || transitionPhase !== "ready")
      return;
    const requestBack = () => {
      if (isScrollBackRequestedRef.current) return;
      isScrollBackRequestedRef.current = true;
      onScrollBack();
    };
    const handleWheel = (event: WheelEvent) => {
      if (scroller.scrollTop <= 1 && event.deltaY < 0) {
        event.preventDefault();
        requestBack();
      }
    };
    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current =
        scroller.scrollTop <= 1 ? event.touches[0]?.clientY ?? null : null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY !== null && currentY !== undefined && currentY - startY > 36) {
        event.preventDefault();
        requestBack();
      }
    };
    const clearTouch = () => {
      touchStartYRef.current = null;
    };
    scroller.addEventListener("wheel", handleWheel, { passive: false });
    scroller.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scroller.addEventListener("touchmove", handleTouchMove, { passive: false });
    scroller.addEventListener("touchend", clearTouch, { passive: true });
    scroller.addEventListener("touchcancel", clearTouch, { passive: true });
    return () => {
      scroller.removeEventListener("wheel", handleWheel);
      scroller.removeEventListener("touchstart", handleTouchStart);
      scroller.removeEventListener("touchmove", handleTouchMove);
      scroller.removeEventListener("touchend", clearTouch);
      scroller.removeEventListener("touchcancel", clearTouch);
    };
  }, [isCovered, onScrollBack, transitionPhase]);
  return (
    <div
      className="artwork-page"
      data-transition-phase={transitionPhase}
      data-intro-locked={isIntroLocked || undefined}
      data-static-preview={isStaticPreview || undefined}
      data-direct-entry={isDirectEntry || undefined}
      data-active-section="00"
      aria-hidden={isCovered || undefined}
    >
      <div className="artwork-page-scroller" ref={scrollerRef}>
        <main
          className="artwork-page-content"
          key={artwork.id}
          data-browse-direction={browseDirection || undefined}
        >
          <ArtworkOverview
            artwork={artwork}
            transitionPhase={transitionPhase}
            usesSharedArtwork={usesSharedArtwork}
            browseDirection={browseDirection}
            onIntroReady={handleIntroReady}
            isStaticPreview={isStaticPreview}
          />
          <DetailsSection artwork={artwork} onAddToCart={onAddToCart} />
        </main>
      </div>
      <nav className="artwork-section-progress" aria-label="Artwork sections">
        <button
          type="button"
          onClick={() => scrollToStage("00")}
          aria-label="Artwork preview"
        >
          00
        </button>
        <i className="artwork-progress-animation" aria-hidden="true" />
        <button
          type="button"
          onClick={() => scrollToStage("01")}
          aria-label="Completed artwork presentation"
        >
          01
        </button>
        <i className="artwork-progress-sections" aria-hidden="true" />
        <button
          type="button"
          onClick={() => scrollToStage("02")}
          aria-label="Artwork details"
        >
          02
        </button>
      </nav>
    </div>
  );
}
