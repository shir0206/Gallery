import type { Artwork } from "@/types/artwork";
import { formatArtworkDimensions } from "@/utils";
import "./ArtworkOverview.css";

interface ArtworkOverviewProps {
  artwork: Artwork;
  onBack?: () => void;
}
function DetailCrop({ artwork, index }: { artwork: Artwork; index: number }) {
  return (
    <div className={`overview-crop overview-crop-${index + 1}`}>
      <img className="overview-crop-image" src={artwork.imageUrl} alt="" />
    </div>
  );
}

function ArtworkFacts({ artwork }: { artwork: Artwork }) {
  const dimensions = formatArtworkDimensions(
    artwork.dimensions.width,
    artwork.dimensions.height,
    artwork.dimensions.unit
  );
  return (
    <>
      <p className="overview-technical">
        Original {artwork.medium.toLowerCase()} · {dimensions} · {artwork.year}.
      </p>
      <dl className="overview-metadata">
        <div>
          <dt>Year</dt>
          <dd>{artwork.year}</dd>
        </div>
        <div>
          <dt>Dimensions</dt>
          <dd>{dimensions}</dd>
        </div>
        <div>
          <dt>Medium</dt>
          <dd>{artwork.medium}</dd>
        </div>
        <div>
          <dt>Original</dt>
          <dd>One of one</dd>
        </div>
        <div>
          <dt>Signed</dt>
          <dd>
            {artwork.commerce?.signed ? "By the artist" : "Not specified"}
          </dd>
        </div>
      </dl>
    </>
  );
}

export function ArtworkOverview({ artwork, onBack }: ArtworkOverviewProps) {
  if (artwork.orientation !== "portrait") {
    return (
      <section
        className="artwork-overview"
        data-orientation={artwork.orientation}
        aria-labelledby="artwork-title"
      >
        <div className="overview-information">
          {onBack && (
            <button className="overview-back" type="button" onClick={onBack}>
              ← <span>Gallery</span>
            </button>
          )}
          <div className="overview-copy">
            <h1 id="artwork-title">{artwork.title}</h1>
            <p className="overview-description">
              {artwork.description.inspiration}
            </p>
            <span className="overview-rule" aria-hidden="true" />
            <ArtworkFacts artwork={artwork} />
          </div>
        </div>
        <div className="overview-visual">
          <div className="overview-main-art">
            <img
              src={artwork.imageUrl}
              alt={`${artwork.title} by ${artwork.artist}`}
            />
          </div>
          <div className="overview-detail-label" aria-hidden="true">
            <span>Details</span>
            <i />
          </div>
          <div className="overview-crops">
            <DetailCrop artwork={artwork} index={0} />
            <DetailCrop artwork={artwork} index={1} />
            <DetailCrop artwork={artwork} index={2} />
            <DetailCrop artwork={artwork} index={3} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="artwork-overview"
      data-orientation={artwork.orientation}
      aria-labelledby="artwork-title"
    >
      <div className="overview-crops" aria-label="Artwork details">
        <DetailCrop artwork={artwork} index={0} />
        <DetailCrop artwork={artwork} index={1} />
        <DetailCrop artwork={artwork} index={2} />
        <DetailCrop artwork={artwork} index={3} />
      </div>
      <div className="overview-detail-label" aria-hidden="true">
        <span>Details</span>
        <i />
        <small>{artwork.medium} / Paper</small>
      </div>
      <div className="overview-main-art">
        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
        />
      </div>
      <div className="overview-information">
        {onBack && (
          <button className="overview-back" type="button" onClick={onBack}>
            ← <span>Gallery</span>
          </button>
        )}
        <div className="overview-copy">
          <h1 id="artwork-title">{artwork.title}</h1>
          <p className="overview-description">
            {artwork.description.inspiration}
          </p>
          <span className="overview-rule" aria-hidden="true" />
          <ArtworkFacts artwork={artwork} />
        </div>
      </div>
    </section>
  );
}
