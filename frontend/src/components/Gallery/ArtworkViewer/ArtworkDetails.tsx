import type { Artwork } from '@/types/artwork';
import { formatArtworkDate, formatArtworkDimensions } from '@/utils';
import styles from './ArtworkDetails.module.css';

interface ArtworkDetailsProps {
  artwork: Artwork;
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
export function ArtworkDetails({ artwork }: ArtworkDetailsProps) {
  const { day, month, year, dimensions } = artwork;

  return (
    <div className={styles.details}>
      <h1 className={styles.title}>{artwork.title}</h1>
      <p className={styles.artist}>{artwork.artist}</p>

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Date</dt>
          <dd>{formatArtworkDate(day, month, year)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Medium</dt>
          <dd>{artwork.medium}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Dimensions</dt>
          <dd>{formatArtworkDimensions(dimensions.width, dimensions.height, dimensions.unit)}</dd>
        </div>
      </dl>

      {artwork.category.length > 0 && (
        <ul className={styles.categories}>
          {artwork.category.map((category) => (
            <li key={category} className={styles.category}>
              {category}
            </li>
          ))}
        </ul>
      )}

      <dl className={styles.description}>
        {DESCRIPTION_SECTIONS.map(({ key, label }) => {
          const value = artwork.description[key];
          if (!value) return null;
          return (
            <div key={key} className={styles.descriptionSection}>
              <dt className={styles.descriptionLabel}>{label}</dt>
              <dd className={styles.descriptionValue}>{value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
