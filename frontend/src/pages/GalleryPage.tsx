import { useEffect, useState } from 'react';
import { getArtworkCollection } from '@/api/artworkApi';
import type { ArtworkCollectionResponse } from '@/types/artwork';
import { Gallery } from '@/components/Gallery/Gallery';

const FALLBACK_ERROR_MESSAGE = 'Could not load the gallery collection.';

/**
 * Top-level screen: owns data fetching/loading state and hands
 * the resolved collection down to the Gallery once it's ready.
 */
export function GalleryPage() {
  const [data, setData] = useState<ArtworkCollectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getArtworkCollection()
      .then((response) => {
        if (isMounted) setData(response);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : FALLBACK_ERROR_MESSAGE);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (!data) {
    return <div>Loading gallery…</div>;
  }

  return <Gallery data={data} />;
}
