import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (progress: number, start: number, end: number) => clamp((progress - start) / (end - start));
// The presentation's last reveal historically finished at 70% of a much
// longer sticky track. Keep that animation timing, but let the track itself
// end as soon as the reveal is complete so scrolling continues immediately.
const PRESENTATION_TIMELINE_END = .7;

export function useScrollPresentation(ref: RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    const track = ref.current;
    const scroller = track?.closest<HTMLElement>(".artwork-page-scroller");
    const page = track?.closest<HTMLElement>(".artwork-page");
    if (!track || !scroller || !page || !enabled) return;
    const sharedImage = document.querySelector<HTMLElement>(
      ".artwork-viewer-frame-transition-target .artwork-viewer-image-button",
    );
    const destination = track.querySelector<HTMLElement>(".overview-main-art");
    const camera = document.querySelector<HTMLElement>(".gallery-camera");
    const sharedStart = sharedImage?.getBoundingClientRect();
    let frame = 0;
    let hasScrolled = false;
    const update = () => {
      frame = 0;
      const max = Math.max(1, track.offsetHeight - scroller.clientHeight);
      const progress = clamp((scroller.scrollTop - track.offsetTop) / max);
      const timelineProgress = progress * PRESENTATION_TIMELINE_END;
      const detailsProgress = clamp(
        (scroller.scrollTop - track.offsetTop - max) / scroller.clientHeight,
      );
      page.style.setProperty("--overview-progress", progress.toFixed(4));
      page.style.setProperty("--section-progress", detailsProgress.toFixed(4));
      page.dataset.activeSection = progress < 1 ? "00" : detailsProgress > .5 ? "02" : "01";
      if (!hasScrolled && progress > .001) {
        hasScrolled = true;
        track.setAttribute("data-has-scrolled", "");
      }
      const artworkReveal = .58 + range(timelineProgress, 0, .18) * .42;
      const values = {
		"--p": progress, "--opening": 1 - range(timelineProgress,0,.3), "--surface-in": range(timelineProgress,.015,.16), "--title-in": 1, "--title-part": range(timelineProgress,.05,.18),
        "--art-in": artworkReveal, "--art-settle": range(timelineProgress,.04,.26),
		"--detail-1": range(timelineProgress,.2,.3), "--detail-2": range(timelineProgress,.26,.36),
		"--detail-3": range(timelineProgress,.32,.42), "--detail-4": range(timelineProgress,.38,.48),
		"--rail-in": range(timelineProgress,.28,.42), "--copy-in": range(timelineProgress,.4,.55),
		"--facts-in": range(timelineProgress,.52,PRESENTATION_TIMELINE_END),
      };
      Object.entries(values).forEach(([name,value]) => track.style.setProperty(name, value.toFixed(4)));
      document.documentElement.style.setProperty('--shared-scroll', range(timelineProgress,.02,.27).toFixed(4));
      document.documentElement.style.setProperty('--shared-surface-in', range(timelineProgress,.015,.16).toFixed(4));

      if (sharedImage && sharedStart && destination && camera && sharedStart.width > 1 && sharedStart.height > 1) {
        const slot = destination.getBoundingClientRect();
        const imageRatio = sharedStart.width / sharedStart.height;
        const slotRatio = slot.width / Math.max(1, slot.height);
        const fittedWidth = slotRatio > imageRatio ? slot.height * imageRatio : slot.width;
        const isPortrait = track.dataset.orientation === "portrait";
        const targetLeft = isPortrait ? slot.left : slot.left + (slot.width - fittedWidth) / 2;
        const targetTop = slot.top;
        const settle = range(timelineProgress, .035, .29);
        const eased = 1 - Math.pow(1 - settle, 3);
        const desiredLeft = sharedStart.left + (targetLeft - sharedStart.left) * eased;
        const desiredTop = sharedStart.top + (targetTop - sharedStart.top) * eased;
        const desiredWidth = sharedStart.width + (fittedWidth - sharedStart.width) * eased;
        const matrix = new DOMMatrixReadOnly(getComputedStyle(camera).transform);
        const cameraScale = Math.max(.001, matrix.a);

        sharedImage.style.setProperty("--shared-image-x", `${(desiredLeft - sharedStart.left) / cameraScale}px`);
        sharedImage.style.setProperty("--shared-image-y", `${(desiredTop - sharedStart.top) / cameraScale}px`);
        sharedImage.style.setProperty("--shared-image-scale", `${desiredWidth / sharedStart.width}`);
        sharedImage.setAttribute("data-scroll-settling", "");
      }
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    scroller.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (sharedImage) {
        sharedImage.style.removeProperty("--shared-image-x");
        sharedImage.style.removeProperty("--shared-image-y");
        sharedImage.style.removeProperty("--shared-image-scale");
        sharedImage.removeAttribute("data-scroll-settling");
      }
      page.style.removeProperty("--section-progress");
      page.style.removeProperty("--overview-progress");
      page.dataset.activeSection = "00";
    };
  }, [ref, enabled]);
}
