import type { Artwork } from '@/types/artwork';
import { formatArtworkDate, formatArtworkDimensions } from '@/utils';
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
 * Editorial "feature spread" for a single artwork — the magazine-style
 * counterpart to the museum-wall ArtworkViewer/ArtworkDetails pairing.
 *
 * Deliberately not a variant of ArtworkDetails: the two express
 * different ideas of what the page is for. ArtworkDetails is a wall
 * plaque (title, then a catalogue fact table, then three equally
 * weighted labeled paragraphs). This is a spread built around one
 * large narrative paragraph, with a cropped hero image and a quiet
 * caption column doing the supporting work — cataloguing facts are
 * present but deliberately de-emphasized into a single collapsible
 * line at the very end.
 *
 * Phase 2 scope: layout + styling only, using the existing Artwork
 * shape. Not yet wired into routing (that's Phase 3) — this component
 * takes its artwork as a prop so it can be rendered standalone or
 * dropped into a route later without changes.
 */
export function ArtworkPage({ artwork, onBack, onPrevious, onNext }: ArtworkPageProps) {
  const { day, month, year, dimensions } = artwork;
  const hasStepping = Boolean(onPrevious && onNext);

  return (
    <article className="artwork-page">
      <header className="artwork-page-header">
        {onBack && (
          <button type="button" className="artwork-page-back" onClick={onBack}>
            ← Gallery
          </button>
        )}

        <div className="artwork-page-heading">
          <p className="artwork-page-artist">{artwork.artist}</p>
          <h1 className="artwork-page-title">{artwork.title}</h1>
        </div>

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

      <div className="artwork-page-hero" data-orientation={artwork.orientation}>
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          className="artwork-page-hero-image"
        />
      </div>

      <div className="artwork-page-body">
        <aside className="artwork-page-caption">
          {artwork.description.materials && <p>{artwork.description.materials}</p>}
          {artwork.description.visual && <p>{artwork.description.visual}</p>}
        </aside>

        <div className="artwork-page-narrative">
          <p className="artwork-page-narrative-text">
            {artwork.description.inspiration || artwork.description.visual}
          </p>
        </div>
      </div>

      <details className="artwork-page-facts">
        <summary className="artwork-page-facts-summary">Details</summary>
        <dl className="artwork-page-facts-list">
          <div className="artwork-page-facts-row">
            <dt>Date</dt>
            <dd>{formatArtworkDate(day, month, year)}</dd>
          </div>
          <div className="artwork-page-facts-row">
            <dt>Medium</dt>
            <dd>{artwork.medium}</dd>
          </div>
          <div className="artwork-page-facts-row">
            <dt>Dimensions</dt>
            <dd>{formatArtworkDimensions(dimensions.width, dimensions.height, dimensions.unit)}</dd>
          </div>
          {artwork.category.length > 0 && (
            <div className="artwork-page-facts-row">
              <dt>Category</dt>
              <dd>{artwork.category.join(', ')}</dd>
            </div>
          )}
        </dl>
      </details>
    </article>
  );
}
