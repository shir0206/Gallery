import type { Artwork } from '@/types/artwork';
import { formatArtworkDate, formatArtworkDimensions } from '@/utils';
import './ArtworkDetails.css';

interface ArtworkDetailsProps {
  artwork: Artwork;
  /** Opens the editorial feature-spread view (ArtworkPage) for this artwork. Omit to hide the link. */
  onOpenFeature?: () => void;
}

/** Ordered (label, value) pairs for the structured description block. */
const DESCRIPTION_SECTIONS: Array<{ key: keyof Artwork['description']; label: string }> = [
  { key: 'materials', label: 'Materials' },
  { key: 'visual', label: 'Visual' },
  { key: 'inspiration', label: 'Inspiration' },
];

/**
 * Editorial detail panel for the currently selected artwork: title,
 * artist, date, medium, dimensions, categories, and the structured
 * (materials / visual / inspiration) description.
 */
export function ArtworkDetails({ artwork, onOpenFeature }: ArtworkDetailsProps) {
  const { day, month, year, dimensions } = artwork;

  return (
    <div className="artwork-details">
      <h1 className="artwork-details-title">{artwork.title}</h1>
      <p className="artwork-details-artist">{artwork.artist}</p>

      <dl className="artwork-details-facts">
        <div className="artwork-details-fact">
          <dt>Date</dt>
          <dd>{formatArtworkDate(day, month, year)}</dd>
        </div>
        <div className="artwork-details-fact">
          <dt>Medium</dt>
          <dd>{artwork.medium}</dd>
        </div>
        <div className="artwork-details-fact">
          <dt>Dimensions</dt>
          <dd>{formatArtworkDimensions(dimensions.width, dimensions.height, dimensions.unit)}</dd>
        </div>
      </dl>

      {artwork.category.length > 0 && (
        <ul className="artwork-details-categories">
          {artwork.category.map((category) => (
            <li key={category} className="artwork-details-category">
              {category}
            </li>
          ))}
        </ul>
      )}

      <dl className="artwork-details-description">
        {DESCRIPTION_SECTIONS.map(({ key, label }) => {
          const value = artwork.description[key];
          if (!value) return null;
          return (
            <div key={key} className="artwork-details-description-section">
              <dt className="artwork-details-description-label">{label}</dt>
              <dd className="artwork-details-description-value">{value}</dd>
            </div>
          );
        })}
      </dl>

      {onOpenFeature && (
        <button type="button" className="artwork-details-feature-link" onClick={onOpenFeature}>
          Read the feature spread →
        </button>
      )}
    </div>
  );
}
