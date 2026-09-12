import { createContext, useContext } from "react";
import type { ArtworkCollectionResponse } from "@/types/artwork";

export interface ArtworkCollectionState {
  data: ArtworkCollectionResponse | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const ArtworkCollectionContext =
  createContext<ArtworkCollectionState | null>(null);

export function useArtworkCollection(): ArtworkCollectionState {
  const context = useContext(ArtworkCollectionContext);
  if (!context) {
    throw new Error(
      "useArtworkCollection must be used within an ArtworkCollectionProvider"
    );
  }
  return context;
}
