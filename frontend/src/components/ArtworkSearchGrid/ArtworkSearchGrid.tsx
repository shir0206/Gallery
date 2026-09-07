import type { Artwork } from '@/types/artwork';
import './ArtworkSearchGrid.css';

interface ArtworkSearchGridProps {
  artworks: Artwork[];
  onSelectArtwork: (artworkId: string) => void;
}

export function ArtworkSearchGrid({ artworks, onSelectArtwork }: ArtworkSearchGridProps) {
  return (
    <div className="artwork-search-grid">
      {artworks.map((artwork) => (
        <button
          type="button"
          className="artwork-search-card"
          key={artwork.id}
          onClick={() => onSelectArtwork(artwork.id)}
          aria-label={`View ${artwork.title} by ${artwork.artist}`}
        >
          <span className="artwork-search-image">
            <img src={artwork.imageUrl} alt="" loading="lazy" />
          </span>
          <strong>{artwork.title}</strong>
          <small>
            {artwork.year} <span aria-hidden="true">·</span> {artwork.medium}
          </small>
        </button>
      ))}
    </div>
  );
}
