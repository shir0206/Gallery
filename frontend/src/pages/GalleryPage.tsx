import { useCallback, useEffect, useState } from 'react';
import { getArtworkCollection } from '@/api/artworkApi';
import type { ArtworkCollectionResponse } from '@/types/artwork';
import { Gallery } from '@/components/Gallery/Gallery';
import { GalleryStatus } from '@/components/Gallery/GalleryStatus/GalleryStatus';
import { ArtworkPage } from '@/pages/ArtworkPage/ArtworkPage';
import { HomePage } from '@/pages/HomePage/HomePage';
import { getAdjacentId } from '@/utils';

const ERROR_MESSAGE = 'Unable to load the gallery.';

/**
 * Top-level screen: owns data fetching/loading state and hands the
 * resolved collection down to the Gallery once it's ready.
 *
 * Loading, fetch failure, and an empty collection are all rendered
 * through GalleryStatus against the same room background as the
 * loaded gallery, rather than a bare/blank screen — so however the
 * fetch goes, it still feels like the same space.
 *
 * The failure message shown to the user is always the fixed
 * ERROR_MESSAGE rather than the underlying ArtworkApiError's own
 * `.message` — that's logged to the console for debugging, but a
 * visitor doesn't need to know whether it was Firestore, the network,
 * or malformed data; they need to know it failed and how to retry.
 *
 * Also owns which of the three screens is showing: the browsable
 * HomePage grid (default), the immersive museum-wall Gallery (opened
 * via HomePage's "View as gallery wall" link, exited via Gallery's
 * own "Grid view" control), or the editorial ArtworkPage feature
 * spread (opened from either a grid card or the wall's "Read the
 * feature spread" link). This is plain state rather than a router —
 * three screens isn't yet worth the added dependency. `featureArtworkId`
 * is independent of `showWallView`: opening a feature spread doesn't
 * disturb whichever of grid/wall was showing underneath, so closing
 * it (onBack) returns to exactly that.
 */
export function GalleryPage() {
  const [data, setData] = useState<ArtworkCollectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featureArtworkId, setFeatureArtworkId] = useState<string | null>(null);
  const [showWallView, setShowWallView] = useState(false);

  const loadGallery = useCallback(() => {
    let isMounted = true;
    setError(null);
    setData(null);
    setFeatureArtworkId(null);
    setShowWallView(false);

    getArtworkCollection()
      .then((response) => {
        if (isMounted) setData(response);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error('Failed to load the gallery collection:', err);
        setError(ERROR_MESSAGE);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => loadGallery(), [loadGallery]);

  if (error) {
    return <GalleryStatus variant="error" message={ERROR_MESSAGE} onRetry={loadGallery} />;
  }

  if (!data) {
    return <GalleryStatus variant="loading" message="Loading gallery..." />;
  }

  if (data.artworks.length === 0) {
    return <GalleryStatus variant="empty" message="No artworks available." />;
  }

  const featureArtwork = featureArtworkId
    ? data.artworks.find((artwork) => artwork.id === featureArtworkId)
    : undefined;

  if (featureArtwork) {
    return (
      <ArtworkPage
        artwork={featureArtwork}
        onBack={() => setFeatureArtworkId(null)}
        onPrevious={() =>
          setFeatureArtworkId(getAdjacentId(data.artworks, featureArtworkId, 'previous'))
        }
        onNext={() =>
          setFeatureArtworkId(getAdjacentId(data.artworks, featureArtworkId, 'next'))
        }
      />
    );
  }

  return showWallView ? (
    <Gallery
      data={data}
      onOpenFeature={setFeatureArtworkId}
      onExitWall={() => setShowWallView(false)}
    />
  ) : (
    <HomePage
      artworks={data.artworks}
      onSelectArtwork={setFeatureArtworkId}
      onViewWall={() => setShowWallView(true)}
    />
  );
}
