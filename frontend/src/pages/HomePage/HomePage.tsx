import { ArtworkSearchGrid } from '@/components/ArtworkSearchGrid/ArtworkSearchGrid';
import type { Artwork } from '@/types/artwork';
import './HomePage.css';

interface HomePageProps {
  artworks: Artwork[];
  /** Opens the editorial feature spread (ArtworkPage) for the given artwork. */
  onSelectArtwork: (artworkId: string) => void;
  /** Switches to the immersive museum-wall experience (Gallery). */
  onViewWall: () => void;
}

/**
 * Default landing screen: a browsable grid of the whole collection,
 * replacing the fixed 3D wall as the primary way visitors first meet
 * the gallery. The wall (`Gallery`/`ArtworkViewer`) survives as a
 * secondary "immersive" mode, reachable via the link in the header —
 * a deliberate choice per the UI plan (§1.2) rather than dropping it,
 * since rebuilding it as a scrollable multi-painting perspective is a
 * bigger, separate effort.
 *
 * Cards delegate navigation to GalleryPage, which opens the selected
 * artwork's URL while preserving this grid as its background view.
 */
export function HomePage({ artworks, onSelectArtwork, onViewWall }: HomePageProps) {
  return (
    <div className="home-page">
      <header className="home-page-header">
        <div className="home-page-heading">
          <p className="home-page-eyebrow">Collection</p>
          <h1 className="home-page-title">The Gallery</h1>
        </div>
        <button type="button" className="home-page-wall-link" onClick={onViewWall}>
          View as gallery wall →
        </button>
      </header>

      <ArtworkSearchGrid artworks={artworks} onSelectArtwork={onSelectArtwork} />
    </div>
  );
}
