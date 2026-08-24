import './GalleryLoader.css';

/**
 * A gallery-appropriate stand-in for a spinner: an empty picture
 * frame (the artwork's silhouette before it's arrived) with a slow
 * light sweep across it, plus a thin placeholder bar standing in for
 * the not-yet-loaded wall label beneath it. Reads as "a piece is
 * about to be hung here" rather than a generic loading indicator.
 * Purely decorative — the actual "Loading gallery..." text sits
 * alongside it and carries the meaning for assistive tech.
 */
export function GalleryLoader() {
  return (
    <div className="gallery-loader" aria-hidden="true">
      <div className="gallery-loader-frame">
        <div className="gallery-loader-sweep" />
      </div>
      <div className="gallery-loader-label" />
    </div>
  );
}
