import type { Artwork } from '@/types/artwork';
import { HeroSection } from './sections/HeroSection';
import { CollageSection } from './sections/CollageSection';
import { DetailsSection } from './sections/DetailsSection';
import './ArtworkPage.css';

interface ArtworkPageProps {
  artwork: Artwork;
  /** Optional — omit to render without a "back to gallery" link (e.g. in isolation/preview). */
  onBack?: () => void;
  /** Optional prev/next stepping, mirroring ArtworkViewer's controls. Both must be provided together. */
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * Three-part scrollytelling spread for a single artwork: a hero, a
 * collage of cropped details + unlabeled text, and a details section
 * combining the catalogue facts with an "in your house" mockup and
 * purchase link. The back/stepper controls are a fixed "chrome" bar
 * pinned above all three sections, rather than living inside any one
 * of them, since they need to stay reachable regardless of scroll
 * position.
 */
export function ArtworkPage({ artwork, onBack, onPrevious, onNext }: ArtworkPageProps) {
  const hasStepping = Boolean(onPrevious && onNext);

  return (
    <div className="artwork-page">
      <header className="artwork-page-chrome">
        {onBack ? (
          <button type="button" className="artwork-page-back" onClick={onBack}>
            ← Gallery
          </button>
        ) : (
          <span />
        )}

        {hasStepping && (
          <div className="artwork-page-stepper">
            <button
              type="button"
              className="artwork-page-step-button"
              onClick={onPrevious}
              aria-label="Previous artwork"
            >
              ‹
            </button>
            <button
              type="button"
              className="artwork-page-step-button"
              onClick={onNext}
              aria-label="Next artwork"
            >
              ›
            </button>
          </div>
        )}
      </header>

      <div className="artwork-page-scroller">
        <HeroSection artwork={artwork} />
        <CollageSection artwork={artwork} />
        <DetailsSection artwork={artwork} />
      </div>
    </div>
  );
}
