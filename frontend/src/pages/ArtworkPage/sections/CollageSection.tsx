import type { CSSProperties } from 'react';
import type { Artwork } from '@/types/artwork';
import { formatArtworkDate, formatArtworkDimensions } from '@/utils';
import './CollageSection.css';

interface CollageSectionProps {
  artwork: Artwork;
}

/**
 * Page 2: a two-column collage. Left: two crops of the painting, a
 * big portrait-shaped one on top and a short landscape-shaped one
 * below. Right: the story sentence set big, then materials set small,
 * then a small near-square third crop, then a compact facts plaque
 * (date, medium, dimensions) — three crops, two sentences, and one
 * facts block, each crop a fixed aspect ratio rather than a
 * flex-stretched box, so "portrait/big", "landscape/short", and
 * "near-square" are genuine shapes and not just relative sizing. The
 * section's height is allowed to grow past one viewport; the outer
 * scroller just keeps going. The three crops share one
 * `background-image` via a CSS custom property so the image URL
 * isn't repeated three times.
 */
export function CollageSection({ artwork }: CollageSectionProps) {
  const { day, month, year, dimensions } = artwork;
  const collageStyle = {
    '--collage-image': `url(${artwork.imageUrl})`,
  } as CSSProperties;

  return (
    <section
      className="collage-section"
      style={collageStyle}
      aria-label={`${artwork.title}, in detail`}
    >
      <h2 className="visually-hidden">Details of {artwork.title}</h2>
      <div className="collage-container">
        <div className="collage-col collage-col-images">
          <div className="collage-crop collage-crop-a" aria-hidden="true" />
          <div className="collage-crop collage-crop-b" aria-hidden="true" />
        </div>
        <div className="collage-col collage-col-text">
          <p className="collage-text collage-text-story">{artwork.description.inspiration}</p>
          <p className="collage-text collage-text-materials">{artwork.description.materials}</p>
          <div className="collage-crop collage-crop-c" aria-hidden="true" />
          <dl className="collage-facts">
            <div className="collage-facts-row">
              <dt>Date</dt>
              <dd>{formatArtworkDate(day, month, year)}</dd>
            </div>
            <div className="collage-facts-row">
              <dt>Medium</dt>
              <dd>{artwork.medium}</dd>
            </div>
            <div className="collage-facts-row">
              <dt>Dimensions</dt>
              <dd>{formatArtworkDimensions(dimensions.width, dimensions.height, dimensions.unit)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
