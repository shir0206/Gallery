import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getArtworkCollection } from "@/api/artworkApi";
import type { ArtworkCollectionResponse } from "@/types/artwork";
import {
  clearArtworkCollectionCache,
  readArtworkCollectionCache,
  writeArtworkCollectionCache,
} from "./artworkCollectionCache";
import { ArtworkCollectionContext } from "./ArtworkCollectionContext";

const ERROR_MESSAGE = "Unable to load the gallery.";

/**
 * Owns the artwork collection: hydrates instantly from the 48h
 * localStorage cache when it's fresh, otherwise fetches and populates
 * it. `refetch` (used by the gallery's retry button) always clears
 * the cache first, so a failed/expired state can't loop on stale data.
 */
export function ArtworkCollectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<ArtworkCollectionResponse | null>(() =>
    readArtworkCollectionCache()
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(data === null);

  useEffect(() => {
    if (data !== null) return;
    let isMounted = true;

    getArtworkCollection()
      .then((response) => {
        if (!isMounted) return;
        writeArtworkCollectionCache(response);
        setData(response);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error("Failed to load the gallery collection:", err);
        setError(ERROR_MESSAGE);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [data]);

  const refetch = useCallback(() => {
    clearArtworkCollectionCache();
    setLoading(true);
    setError(null);
    setData(null);
  }, []);

  return (
    <ArtworkCollectionContext.Provider
      value={{ data, error, loading, refetch }}
    >
      {children}
    </ArtworkCollectionContext.Provider>
  );
}
