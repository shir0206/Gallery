import type { GalleryEnvironment } from '@/types/artwork';
import './GalleryBackground.css';

interface GalleryBackgroundProps {
  environment: GalleryEnvironment;
}

/**
 * Renders the museum-like environment behind the artwork: a full-bleed,
 * cover-fit background image over a dark gradient fallback (used while
 * no image is configured, or if it fails to load), plus a dim overlay
 * so foreground artwork/nav stay legible. Entirely independent of the
 * artwork components — swapping `environment.backgroundImageUrl` (or
 * the whole environment source) never touches ArtworkViewer/Navigation.
 */
export function GalleryBackground({ environment }: GalleryBackgroundProps) {
  return (
    <div className="gallery-background" role="presentation" aria-hidden="true">
      {environment.backgroundImageUrl && (
        <>
          <img className="gallery-background-overscan" src={environment.backgroundImageUrl} alt="" decoding="async" />
          <img className="gallery-background-image" src={environment.backgroundImageUrl} alt="" decoding="async" />
        </>
      )}
    </div>
  );
}
