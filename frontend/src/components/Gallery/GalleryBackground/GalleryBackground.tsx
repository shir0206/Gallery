import type { GalleryEnvironment } from '@/types/artwork';
import woodenFloorUrl from '@/assets/wooden-floor.webp';
import './GalleryBackground.css';

interface GalleryBackgroundProps {
  environment: GalleryEnvironment;
}

/**
 * Renders the museum-like environment behind the artwork. The room is
 * assembled from decorative layers so it remains independent of the
 * interactive artwork viewer and navigation mounted above it.
 */
export function GalleryBackground({ environment }: GalleryBackgroundProps) {
  return (
    <div className="gallery-background" data-environment={environment.name} role="presentation" aria-hidden="true">
      <div className="gallery-background-texture" />
      <div className="gallery-background-grain" />
      <img className="gallery-background-floor" src={woodenFloorUrl} alt="" decoding="async" />
      <div className="gallery-background-baseboard" />
    </div>
  );
}
